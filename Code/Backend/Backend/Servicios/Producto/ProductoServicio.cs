using Backend.Infrestructura.Conexion;
using Backend.Modelos.Entidades;
using Backend.Modelos.ResponseDto;
using Backend.Modelos.RequestDto;
using Backend.Infrestructura.Repositorio;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Servicios;

public class ProductoServicio : IProductoServicio
{
    private readonly IProductoRepositorio _repositorio;
    private readonly RedisContext _redisContext;
    private readonly ElasticsearchContext _elasticContext;
    private readonly ClickHouseContext _clickHouseContext;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly MongoDbContext _mongoContext;
    private readonly MarketplaceDbContext _dbContext;

    public ProductoServicio(
        IProductoRepositorio repositorio,
        RedisContext redisContext,
        ElasticsearchContext elasticContext,
        ClickHouseContext clickHouseContext,
        IHttpContextAccessor httpContextAccessor,
        MongoDbContext mongoContext,
        MarketplaceDbContext dbContext)
    {
        _repositorio = repositorio;
        _redisContext = redisContext;
        _elasticContext = elasticContext;
        _clickHouseContext = clickHouseContext;
        _httpContextAccessor = httpContextAccessor;
        _mongoContext = mongoContext;
        _dbContext = dbContext;
    }

    public async Task<List<ProductoResponseDto>> BuscarProductosAsync(string? terminoBusqueda, List<int>? categorias, int pagina)
    {
        int cantidadPorPagina = 20;
        string region = _httpContextAccessor.HttpContext?.Items["Region"]?.ToString() ?? "Local";

        // Registrar búsqueda en ClickHouse
        if (!string.IsNullOrWhiteSpace(terminoBusqueda))
        {
            await RegistrarBusquedaClickHouseAsync(terminoBusqueda, region);
        }

        // Redis: Generar clave de caché única
        string cacheKey = $"productos:r{region}:p{pagina}:t{terminoBusqueda ?? "none"}:c{string.Join("-", categorias ?? new List<int>())}";
        var dbRedis = _redisContext.Database;
        var cacheValue = await dbRedis.StringGetAsync(cacheKey);

        if (cacheValue.HasValue)
        {
            var cachedList = JsonSerializer.Deserialize<List<ProductoResponseDto>>(cacheValue.ToString());
            if (cachedList != null) return cachedList;
        }

        List<Producto> productosRaw = new List<Producto>();

        if (!string.IsNullOrWhiteSpace(terminoBusqueda))
        {
            try 
            {
                // Búsqueda en Elasticsearch
                var response = await _elasticContext.Client.SearchAsync<Producto>(s => s
                    .Indices("productos")
                    .Query(q => q
                        .Match(m => m
                            .Field("nombre")
                            .Query(terminoBusqueda)
                        )
                    )
                    .From((pagina - 1) * cantidadPorPagina)
                    .Size(cantidadPorPagina)
                );

                if (response.IsValidResponse && response.Documents.Any())
                {
                    var ids = response.Documents.Select(d => d.IdProducto).ToList();
                    productosRaw = await _repositorio.ObtenerPorIds(ids);
                }
            }
            catch 
            {
                // Fallback silencioso si Elastic no tiene el índice aún o falla la conexión
            }

            // Si Elasticsearch falló o no devolvió resultados, buscamos en PostgreSQL directamente
            if (productosRaw.Count == 0)
            {
                productosRaw = await _repositorio.ObtenerTodosPaginados(pagina, cantidadPorPagina, categorias, terminoBusqueda);
            }
        }
        else
        {
            productosRaw = await _repositorio.ObtenerTodosPaginados(pagina, cantidadPorPagina, categorias);
        }

        // Obtener calificaciones de Mongo
        var idsProductos = productosRaw.Select(p => p.IdProducto).ToList();
        List<BsonDocument> resenas = new List<BsonDocument>();
        
        if (idsProductos.Any())
        {
            var collection = _mongoContext.Database.GetCollection<BsonDocument>("resenas_productos");
            var filter = Builders<BsonDocument>.Filter.In("id_producto", idsProductos);
            resenas = await collection.Find(filter).ToListAsync();
        }

        var promedios = resenas
            .GroupBy(r => r["id_producto"].AsInt32)
            .ToDictionary(
                g => g.Key,
                g => g.Average(r => r["calificacion"].AsInt32)
            );

        var conteos = resenas
            .GroupBy(r => r["id_producto"].AsInt32)
            .ToDictionary(
                g => g.Key,
                g => g.Count()
            );

        // Mapeo y cálculo de precios por región
        var resultado = productosRaw.Select(p => 
        {
            double avg = promedios.ContainsKey(p.IdProducto) ? promedios[p.IdProducto] : 0.0;
            int count = conteos.ContainsKey(p.IdProducto) ? conteos[p.IdProducto] : 0;
            return MapearA_Dto(p, region, avg, count);
        }).ToList();

        // Guardar resultado en Redis por 10 minutos
        await dbRedis.StringSetAsync(cacheKey, JsonSerializer.Serialize(resultado), TimeSpan.FromMinutes(10));

        return resultado;
    }

    public async Task<ProductoResponseDto?> ObtenerProductoPorIdAsync(int idProducto)
    {
        string region = _httpContextAccessor.HttpContext?.Items["Region"]?.ToString() ?? "Local";

        var productoRaw = await _repositorio.ObtenerPorId(idProducto);
        if (productoRaw == null) return null;

        // Obtener calificaciones de Mongo
        var collection = _mongoContext.Database.GetCollection<BsonDocument>("resenas_productos");
        var filter = Builders<BsonDocument>.Filter.Eq("id_producto", idProducto);
        var resenas = await collection.Find(filter).ToListAsync();

        double estrellas = 0;
        int cantidadReviews = resenas.Count;
        
        if (cantidadReviews > 0)
        {
            estrellas = resenas.Average(r => r["calificacion"].AsInt32);
        }

        var dto = MapearA_Dto(productoRaw, region, estrellas, cantidadReviews);

        return dto;
    }

    public async Task<ResenasProductoResponseDto> ObtenerResenasDeProductoAsync(int idProducto)
    {
        var collection = _mongoContext.Database.GetCollection<BsonDocument>("resenas_productos");
        var filter = Builders<BsonDocument>.Filter.Eq("id_producto", idProducto);
        var resenasBson = await collection.Find(filter).ToListAsync();

        var response = new ResenasProductoResponseDto();
        response.TotalReviews = resenasBson.Count;

        if (response.TotalReviews == 0)
        {
            return response;
        }

        double sumaEstrellas = 0;

        var idsUsuarios = resenasBson
            .Where(r => r.Contains("id_usuario_cliente"))
            .Select(r => r["id_usuario_cliente"].AsInt32)
            .Distinct()
            .ToList();

        var diccionarioUsuarios = await _repositorio.ObtenerNombresUsuarios(idsUsuarios);

        foreach (var r in resenasBson)
        {
            int calificacion = r.Contains("calificacion") ? r["calificacion"].AsInt32 : 0;
            sumaEstrellas += calificacion;

            switch (calificacion)
            {
                case 5: response.Distribucion.CincoEstrellas++; break;
                case 4: response.Distribucion.CuatroEstrellas++; break;
                case 3: response.Distribucion.TresEstrellas++; break;
                case 2: response.Distribucion.DosEstrellas++; break;
                case 1: response.Distribucion.UnaEstrella++; break;
            }

            string nombreUsuario = "Usuario Anónimo";
            int usuarioId = 0;
            if (r.Contains("id_usuario_cliente"))
            {
                usuarioId = r["id_usuario_cliente"].AsInt32;
                if (diccionarioUsuarios.ContainsKey(usuarioId))
                {
                    nombreUsuario = diccionarioUsuarios[usuarioId];
                }
            }

            var comentarioDto = new ComentarioDto
            {
                IdUsuario = usuarioId,
                Calificacion = calificacion,
                Comentario = r.Contains("comentario") ? r["comentario"].AsString : "",
                NombreUsuario = nombreUsuario,
            };

            if (r.Contains("fecha_creacion"))
            {
                var fechaBson = r["fecha_creacion"];
                if (fechaBson.IsBsonDateTime)
                {
                    comentarioDto.Fecha = fechaBson.ToUniversalTime();
                }
                else if (fechaBson.IsString && DateTime.TryParse(fechaBson.AsString, out var dt))
                {
                    comentarioDto.Fecha = dt;
                }
            }

            response.Comentarios.Add(comentarioDto);
        }

        response.PromedioEstrellas = Math.Round(sumaEstrellas / response.TotalReviews, 1);
        
        // Ordenar por fecha más reciente
        response.Comentarios = response.Comentarios.OrderByDescending(c => c.Fecha).ToList();

        return response;
    }

    public async Task AgregarResenaAsync(int idProducto, int idUsuario, CrearResenaRequestDto request)
    {
        // 1. Validar que el producto exista en PostgreSQL
        var productoExiste = await _repositorio.ObtenerPorId(idProducto);
        if (productoExiste == null)
        {
            throw new ArgumentException("El producto especificado no existe.");
        }

        // 1.5. Validar que el usuario haya comprado el producto
        bool comproProducto = _dbContext.DetallesPedidos
            .Any(dp => dp.IdProducto == idProducto && dp.IdPedidoNavigation.IdCliente == idUsuario);
        
        if (!comproProducto)
        {
            throw new ArgumentException("Solo puedes calificar productos que hayas comprado.");
        }

        // 2. Insertar en MongoDB
        var collection = _mongoContext.Database.GetCollection<BsonDocument>("resenas_productos");

        // 2.5 Validar que no haya reseñado ya
        var filter = Builders<BsonDocument>.Filter.And(
            Builders<BsonDocument>.Filter.Eq("id_producto", idProducto),
            Builders<BsonDocument>.Filter.Eq("id_usuario_cliente", idUsuario)
        );
        var resenaExistente = await collection.Find(filter).FirstOrDefaultAsync();
        if (resenaExistente != null)
        {
            throw new ArgumentException("Ya has calificado este producto.");
        }

        var nuevaResena = new BsonDocument
        {
            { "id_producto", idProducto },
            { "id_usuario_cliente", idUsuario },
            { "calificacion", request.Calificacion },
            { "comentario", request.Comentario },
            { "fecha_creacion", BsonDateTime.Create(DateTime.UtcNow) },
            { "util_votos", 0 }
        };

        await collection.InsertOneAsync(nuevaResena);
        await InvalidarCacheProductosAsync();
    }

    public async Task<List<ProductoResponseDto>> ObtenerMisProductosAsync(int idVendedor)
    {
        string region = _httpContextAccessor.HttpContext?.Items["Region"]?.ToString() ?? "Local";
        var productosRaw = await _repositorio.ObtenerProductosPorVendedorAsync(idVendedor);

        if (!productosRaw.Any())
            return new List<ProductoResponseDto>();

        // Obtener calificaciones de Mongo para estos productos (opcional para listado propio, pero mantiene el DTO consistente)
        var idsProductos = productosRaw.Select(p => p.IdProducto).ToList();
        var collection = _mongoContext.Database.GetCollection<BsonDocument>("resenas_productos");
        var filter = Builders<BsonDocument>.Filter.In("id_producto", idsProductos);
        var resenas = await collection.Find(filter).ToListAsync();

        var promedios = resenas
            .GroupBy(r => r["id_producto"].AsInt32)
            .ToDictionary(g => g.Key, g => g.Average(r => r["calificacion"].AsInt32));

        var conteos = resenas
            .GroupBy(r => r["id_producto"].AsInt32)
            .ToDictionary(g => g.Key, g => g.Count());

        var resultado = productosRaw.Select(p => 
        {
            double avg = promedios.ContainsKey(p.IdProducto) ? promedios[p.IdProducto] : 0.0;
            int count = conteos.ContainsKey(p.IdProducto) ? conteos[p.IdProducto] : 0;
            return MapearA_Dto(p, region, avg, count);
        }).ToList();

        return resultado;
    }

    public async Task<ProductoResponseDto> CrearProductoAsync(int idVendedor, CrearProductoRequestDto request)
    {
        var producto = new Producto
        {
            IdVendedor = idVendedor,
            IdCategoria = request.IdCategoria,
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            PrecioBase = request.PrecioBase ?? 0.01,
            Stock = request.Stock ?? 0,
            UrlImagen = request.UrlImagen,
            FechaCreacion = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified),
            EstadoEliminado = false
        };

        var productoCreado = await _repositorio.AgregarProductoAsync(producto);

        try
        {
            await _elasticContext.Client.IndexAsync(productoCreado, i => i.Index("productos").Id(productoCreado.IdProducto.ToString()));
        }
        catch
        {
            // Falla silenciosa
        }

        await InvalidarCacheProductosAsync();

        string region = _httpContextAccessor.HttpContext?.Items["Region"]?.ToString() ?? "Local";
        return MapearA_Dto(productoCreado, region, 0, 0);
    }

    public async Task ActualizarStockAsync(int idVendedor, int idProducto, ActualizarStockRequestDto request)
    {
        var producto = await _repositorio.ObtenerPorId(idProducto);
        
        if (producto == null || producto.EstadoEliminado)
        {
            throw new ArgumentException("Producto no encontrado.");
        }

        if (producto.IdVendedor != idVendedor)
        {
            throw new UnauthorizedAccessException("No tienes permiso para editar este producto.");
        }

        producto.Stock = request.Stock;
        await _repositorio.ActualizarProductoAsync(producto);

        try
        {
            await _elasticContext.Client.IndexAsync(producto, i => i.Index("productos").Id(producto.IdProducto.ToString()));
        }
        catch
        {
            // Falla silenciosa
        }

        await InvalidarCacheProductosAsync();
    }

    public async Task<ProductoResponseDto> EditarProductoAsync(int idVendedor, int idProducto, EditarProductoRequestDto request)
    {
        var producto = await _repositorio.ObtenerPorId(idProducto);

        if (producto == null || producto.EstadoEliminado)
        {
            throw new ArgumentException("Producto no encontrado.");
        }

        if (producto.IdVendedor != idVendedor)
        {
            throw new UnauthorizedAccessException("No tienes permiso para editar este producto.");
        }

        // Actualizar campos básicos
        producto.Nombre = request.Nombre;
        producto.Descripcion = request.Descripcion;
        producto.PrecioBase = request.PrecioBase ?? producto.PrecioBase;
        producto.Stock = request.Stock ?? producto.Stock;
        producto.UrlImagen = request.UrlImagen;
        producto.IdCategoria = request.IdCategoria;

        // Gestionar precios geolocalizados
        if (request.PreciosGeolocalizados != null)
        {
            // Marcar como eliminados los precios geo existentes que ya no están en la lista
            var geoExistentes = producto.PreciosGeolocalizados?.ToList() ?? new List<Modelos.Entidades.PreciosGeolocalizado>();
            foreach (var existente in geoExistentes)
            {
                existente.EstadoEliminado = true;
            }

            // Agregar o actualizar los nuevos precios geo
            foreach (var precioGeoDto in request.PreciosGeolocalizados)
            {
                var existente = geoExistentes.FirstOrDefault(pg => pg.CodigoPais == precioGeoDto.CodigoPais);
                if (existente != null)
                {
                    // Reactivar y actualizar
                    existente.Multiplicador = precioGeoDto.Multiplicador;
                    existente.EstadoEliminado = false;
                }
                else
                {
                    // Crear nuevo
                    var nuevoPrecioGeo = new Modelos.Entidades.PreciosGeolocalizado
                    {
                        IdProducto = idProducto,
                        CodigoPais = precioGeoDto.CodigoPais,
                        Multiplicador = precioGeoDto.Multiplicador,
                        EstadoEliminado = false
                    };
                    producto.PreciosGeolocalizados!.Add(nuevoPrecioGeo);
                }
            }
        }

        await _repositorio.ActualizarProductoAsync(producto);

        try
        {
            await _elasticContext.Client.IndexAsync(producto, i => i.Index("productos").Id(producto.IdProducto.ToString()));
        }
        catch
        {
            // Falla silenciosa
        }

        await InvalidarCacheProductosAsync();

        string region = _httpContextAccessor.HttpContext?.Items["Region"]?.ToString() ?? "Local";
        return MapearA_Dto(producto, region, 0, 0);
    }

    public async Task ConfigurarOfertaFlashAsync(int idVendedor, int idProducto, ConfigurarOfertaFlashRequestDto request)
    {
        var producto = await _repositorio.ObtenerPorId(idProducto);

        if (producto == null || producto.EstadoEliminado)
        {
            throw new ArgumentException("Producto no encontrado.");
        }

        if (producto.IdVendedor != idVendedor)
        {
            throw new UnauthorizedAccessException("No tienes permiso para editar este producto.");
        }

        var fechaInicioLocal = request.FechaInicio.ToLocalTime();
        var fechaFinLocal = request.FechaFin.ToLocalTime();

        var fechaInicioFinal = DateTime.SpecifyKind(fechaInicioLocal, DateTimeKind.Unspecified);
        var fechaFinFinal = DateTime.SpecifyKind(fechaFinLocal, DateTimeKind.Unspecified);

        var ofertasExistentes = _dbContext.Set<Modelos.Entidades.OfertasFlash>()
            .Where(o => o.IdProducto == idProducto && !o.EstadoEliminado)
            .ToList();

        if (ofertasExistentes.Any())
        {
            var ofertaPrincipal = ofertasExistentes.First();
            ofertaPrincipal.PorcentajeDescuento = request.PorcentajeDescuento;
            ofertaPrincipal.FechaInicio = fechaInicioFinal;
            ofertaPrincipal.FechaFin = fechaFinFinal;

            // Eliminar duplicados si el bug anterior los generó
            foreach (var extra in ofertasExistentes.Skip(1))
            {
                extra.EstadoEliminado = true;
            }
        }
        else
        {
            var nuevaOferta = new Modelos.Entidades.OfertasFlash
            {
                IdProducto = idProducto,
                PorcentajeDescuento = request.PorcentajeDescuento,
                FechaInicio = fechaInicioFinal,
                FechaFin = fechaFinFinal,
                EstadoEliminado = false
            };
            _dbContext.Set<Modelos.Entidades.OfertasFlash>().Add(nuevaOferta);
        }

        await _dbContext.SaveChangesAsync();

        // Limpiar el ChangeTracker y recargar el producto para actualizar Elasticsearch correctamente
        _dbContext.ChangeTracker.Clear();
        var productoActualizado = await _repositorio.ObtenerPorId(idProducto);

        if (productoActualizado != null)
        {
            try
            {
                await _elasticContext.Client.IndexAsync(productoActualizado, i => i.Index("productos").Id(productoActualizado.IdProducto.ToString()));
            }
            catch
            {
                // Falla silenciosa
            }
        }

        // Invalidar caché de Redis
        await InvalidarCacheProductosAsync();
    }

    public async Task<List<string>> ObtenerCodigosPaisAsync()
    {
        var codigosPredeterminados = new List<string> 
        { 
            "BO", // Bolivia
            "PE", // Perú
            "AR", // Argentina
            "CL", // Chile
            "CO", // Colombia
            "MX", // México
            "US", // Estados Unidos
            "ES", // España
            "BR", // Brasil
            "UY", // Uruguay
            "PY", // Paraguay
            "EC", // Ecuador
            "VE"  // Venezuela
        };
        
        return await Task.FromResult(codigosPredeterminados);
    }

    private ProductoResponseDto MapearA_Dto(Producto p, string region, double estrellas, int cantidadReviews)
    {
        double precioAplicado = p.PrecioBase;
        
        if (region != "Local")
        {
            var precioGeo = p.PreciosGeolocalizados?.FirstOrDefault(pg => pg.CodigoPais == region && !pg.EstadoEliminado);
            if (precioGeo != null)
            {
                precioAplicado = p.PrecioBase * precioGeo.Multiplicador;
            }
        }

        double descuento = 0;
        var ahora = DateTime.Now;
        var oferta = p.OfertasFlashes?.FirstOrDefault(o => !o.EstadoEliminado);
        
        OfertaFlashResponseDto? ofertaFlashDto = null;
        if (oferta != null)
        {
            bool estaActiva = (oferta.FechaInicio <= ahora && oferta.FechaFin >= ahora);
            ofertaFlashDto = new OfertaFlashResponseDto
            {
                PorcentajeDescuento = oferta.PorcentajeDescuento,
                FechaInicio = oferta.FechaInicio,
                FechaFin = oferta.FechaFin,
                EstaActiva = estaActiva
            };

            if (estaActiva)
            {
                descuento = oferta.PorcentajeDescuento;
                precioAplicado = precioAplicado - (precioAplicado * (descuento / 100.0));
            }
        }

        List<PrecioGeoResponseDto>? preciosGeoDto = null;
        if (p.PreciosGeolocalizados != null && p.PreciosGeolocalizados.Any(pg => !pg.EstadoEliminado))
        {
            preciosGeoDto = p.PreciosGeolocalizados
                .Where(pg => !pg.EstadoEliminado)
                .Select(pg => new PrecioGeoResponseDto
                {
                    CodigoPais = pg.CodigoPais,
                    Multiplicador = pg.Multiplicador
                }).ToList();
        }

        return new ProductoResponseDto
        {
            IdProducto = p.IdProducto,
            Nombre = p.Nombre,
            Descripcion = p.Descripcion ?? "",
            PrecioBase = p.PrecioBase,
            PrecioAplicado = Math.Round(precioAplicado, 2),
            UrlImagen = p.UrlImagen ?? "",
            Stock = p.Stock,
            PorcentajeDescuentoFlash = descuento,
            IdCategoria = p.IdCategoria,
            Categoria = p.IdCategoriaNavigation?.Nombre ?? "",
            NombreVendedor = p.IdVendedorNavigation != null ? $"{p.IdVendedorNavigation.Nombre} {p.IdVendedorNavigation.Apellido}".Trim() : "",
            Estrellas = Math.Round(estrellas, 1),
            CantidadReviews = cantidadReviews,
            OfertaFlash = ofertaFlashDto,
            PreciosGeolocalizados = preciosGeoDto
        };
    }

    private async Task RegistrarBusquedaClickHouseAsync(string termino, string region)
    {
        try
        {
            await using var conn = _clickHouseContext.GetConnection();
            await conn.OpenAsync();
            using var cmd = conn.CreateCommand();
            
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS busquedas_log (
                    fecha DateTime,
                    termino String,
                    region String
                ) ENGINE = MergeTree()
                ORDER BY fecha;";
            await cmd.ExecuteNonQueryAsync();

            cmd.CommandText = $"INSERT INTO busquedas_log (fecha, termino, region) VALUES (now(), '{termino.Replace("'", "''")}', '{region.Replace("'", "''")}')";
            await cmd.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error en ClickHouse: " + ex.Message);
            // Ignorar excepciones de métricas
        }
    }

    private async Task InvalidarCacheProductosAsync()
    {
        try
        {
            var dbRedis = _redisContext.Database;
            var server = _redisContext.Database.Multiplexer.GetServer(_redisContext.Database.Multiplexer.GetEndPoints()[0]);
            var keys = server.Keys(pattern: "productos:*").ToArray();
            if (keys.Any())
            {
                await dbRedis.KeyDeleteAsync(keys);
            }
        }
        catch
        {
            // Falla silenciosa
        }
    }
}
