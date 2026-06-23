using Backend.Infrestructura.Conexion;
using Backend.Modelos.Entidades;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Infrestructura.Data;

public class DataSeeder
{
    private readonly MarketplaceDbContext _dbContext;
    private readonly ElasticsearchContext _elasticContext;

    public DataSeeder(MarketplaceDbContext dbContext, ElasticsearchContext elasticContext)
    {
        _dbContext = dbContext;
        _elasticContext = elasticContext;
    }

    public async Task SeedAsync()
    {
        // 1. Sincronizar PostgreSQL
        int totalProductos = await _dbContext.Productos.CountAsync();

        if (totalProductos < 10)
        {
            // Insertar datos si no hay
            var categoria1 = await _dbContext.Categorias.FirstOrDefaultAsync(c => c.Nombre == "Electrónica");
            if (categoria1 == null)
            {
                categoria1 = new Categoria { Nombre = "Electrónica", Descripcion = "Gadgets y computadoras" };
                _dbContext.Categorias.Add(categoria1);
            }

            var categoria2 = await _dbContext.Categorias.FirstOrDefaultAsync(c => c.Nombre == "Ropa y Calzado");
            if (categoria2 == null)
            {
                categoria2 = new Categoria { Nombre = "Ropa y Calzado", Descripcion = "Prendas de vestir" };
                _dbContext.Categorias.Add(categoria2);
            }

            await _dbContext.SaveChangesAsync();
        }

        // 2. Sincronizar Elasticsearch (recrear índice y volcar todo)
        var client = _elasticContext.Client;
        
        // Verificar si el índice existe y borrarlo para forzar el reinicio
        var indexExists = await client.Indices.ExistsAsync("productos");
        if (indexExists.Exists)
        {
            await client.Indices.DeleteAsync("productos");
        }

        await client.Indices.CreateAsync("productos");

        // Volcar TODOS los productos desde postgres a elastic
        var todosLosProductos = await _dbContext.Productos.ToListAsync();
        
        if (todosLosProductos.Any())
        {
            var bulkResponse = await client.BulkAsync(b => b
                .Index("productos")
                .IndexMany(todosLosProductos)
            );

            if (!bulkResponse.IsValidResponse)
            {
                Console.WriteLine("Error al indexar en Elasticsearch: " + bulkResponse.DebugInformation);
            }
            else 
            {
                Console.WriteLine($"Se indexaron {todosLosProductos.Count} productos en Elasticsearch con éxito.");
            }
        }
    }
}
