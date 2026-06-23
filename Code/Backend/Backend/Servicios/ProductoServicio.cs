using Backend.Infrestructura.Conexion;
using Backend.Modelos.Entidades;
using Backend.Modelos.ResponseDto;
using Backend.Repositorio;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
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

    public ProductoServicio(
        IProductoRepositorio repositorio,
        RedisContext redisContext,
        ElasticsearchContext elasticContext,
        ClickHouseContext clickHouseContext,
        IHttpContextAccessor httpContextAccessor)
    {
        _repositorio = repositorio;
        _redisContext = redisContext;
        _elasticContext = elasticContext;
        _clickHouseContext = clickHouseContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<ProductoResponseDto>> BuscarProductosAsync(string? terminoBusqueda, List<int>? categorias, int pagina)
    {
        int cantidadPorPagina = 20;
        string region = _httpContextAccessor.HttpContext?.Items["Region"]?.ToString() ?? "Local";

        // Registrar búsqueda en ClickHouse
        if (!string.IsNullOrWhiteSpace(terminoBusqueda))
        {
            _ = RegistrarBusquedaClickHouseAsync(terminoBusqueda, region);
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
                    .Index("productos")
                    .Query(q => q
                        .Match(m => m
                            .Field(f => f.Nombre)
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

        // Mapeo y cálculo de precios por región
        var resultado = productosRaw.Select(p => MapearA_Dto(p, region)).ToList();

        // Guardar resultado en Redis por 10 minutos
        await dbRedis.StringSetAsync(cacheKey, JsonSerializer.Serialize(resultado), TimeSpan.FromMinutes(10));

        return resultado;
    }

    private ProductoResponseDto MapearA_Dto(Producto p, string region)
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
            Categoria = p.IdCategoriaNavigation?.Nombre ?? ""
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
        catch 
        {
            // Ignorar excepciones de métricas
        }
    }
}
