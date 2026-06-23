using Backend.Infrestructura.Conexion;
using Backend.Modelos.Entidades;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Repositorio;

public class ProductoRepositorio : IProductoRepositorio
{
    private readonly MarketplaceDbContext _context;

    public ProductoRepositorio(MarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task<List<Producto>> ObtenerTodosPaginados(int pagina, int cantidadPorPagina, List<int>? categorias = null)
    {
        var fechaActual = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

        var query = _context.Productos
            .Include(p => p.IdCategoriaNavigation)
            .Include(p => p.OfertasFlashes.Where(of => of.FechaInicio <= fechaActual && of.FechaFin >= fechaActual && !of.EstadoEliminado))
            .Include(p => p.PreciosGeolocalizados)
            .AsQueryable();

        if (categorias != null && categorias.Any())
        {
            query = query.Where(p => categorias.Contains(p.IdCategoria));
        }

        return await query
            .OrderBy(p => p.IdProducto)
            .Skip((pagina - 1) * cantidadPorPagina)
            .Take(cantidadPorPagina)
            .ToListAsync();
    }

    public async Task<List<Producto>> ObtenerPorIds(List<int> ids)
    {
        var fechaActual = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

        return await _context.Productos
            .Include(p => p.IdCategoriaNavigation)
            .Include(p => p.OfertasFlashes.Where(of => of.FechaInicio <= fechaActual && of.FechaFin >= fechaActual && !of.EstadoEliminado))
            .Include(p => p.PreciosGeolocalizados)
            .Where(p => ids.Contains(p.IdProducto))
            .ToListAsync();
    }
}
