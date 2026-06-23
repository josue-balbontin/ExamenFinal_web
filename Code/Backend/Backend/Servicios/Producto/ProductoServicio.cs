using Backend.Infrestructura.Conexion;
using Backend.Modelos.Entidades;
using Backend.Modelos.ResponseDto;
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

    public ProductoServicio(
        IProductoRepositorio repositorio,
        RedisContext redisContext,
        ElasticsearchContext elasticContext,
        ClickHouseContext clickHouseContext,
        IHttpContextAccessor httpContextAccessor,
        MongoDbContext mongoContext)
    {
        _repositorio = repositorio;
        _redisContext = redisContext;
        _elasticContext = elasticContext;
        _clickHouseContext = clickHouseContext;
        _httpContextAccessor = httpContextAccessor;
        _mongoContext = mongoContext;
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
                // Fallback silencioso si Elastic no tiene el índice aún
            }
        }
        else
        {
            productosRaw = await _repositorio.ObtenerTodosPaginados(pagina, cantidadPorPagina, categorias);
        }

        // Obtener calificaciones de Mongo
        var idsProductos = productosRaw.Select(p => p.IdProducto).ToList();
        var collection = _mongoContext.Database.GetCollection<BsonDocument>("resenas_productos");
        var filter = Builders<BsonDocument>.Filter.In("id_producto", idsProductos);
        var resenas = await collection.Find(filter).ToListAsync();

        var promedios = resenas
            .GroupBy(r => r["id_producto"].AsInt32)
            .ToDictionary(
                g => g.Key,
                g => g.Average(r => r["calificacion"].AsInt32)
            );

        // Mapeo y cálculo de precios por región
        var resultado = productosRaw.Select(p => MapearA_Dto(p, region, promedios.ContainsKey(p.IdProducto) ? promedios[p.IdProducto] : 0.0)).ToList();

        // Guardar resultado en Redis por 10 minutos
        await dbRedis.StringSetAsync(cacheKey, JsonSerializer.Serialize(resultado), TimeSpan.FromMinutes(10));

        return resultado;
    }

    private ProductoResponseDto MapearA_Dto(Producto p, string region, double estrellas)
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
        var oferta = p.OfertasFlashes?.FirstOrDefault();
        if (oferta != null)
        {
            descuento = oferta.PorcentajeDescuento;
            precioAplicado = precioAplicado - (precioAplicado * (descuento / 100.0));
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
            Estrellas = Math.Round(estrellas, 1)
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
}
