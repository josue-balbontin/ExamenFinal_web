using Backend.Infrestructura.Conexion;
using Backend.Modelos.Entidades;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Infrestructura.Repositorio;

public class ProductoRepositorio : IProductoRepositorio
{
    private readonly MarketplaceDbContext _context;

    public ProductoRepositorio(MarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task<List<Producto>> ObtenerTodosPaginados(int pagina, int cantidadPorPagina, List<int>? categorias = null, string? terminoBusqueda = null)
    {
        var fechaActual = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

        var query = _context.Productos
            .Include(p => p.IdCategoriaNavigation)
            .Include(p => p.IdVendedorNavigation)
            .Include(p => p.OfertasFlashes.Where(of => of.FechaInicio <= fechaActual && of.FechaFin >= fechaActual && !of.EstadoEliminado))
            .Include(p => p.PreciosGeolocalizados)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(terminoBusqueda))
        {
            query = query.Where(p => p.Nombre.ToLower().Contains(terminoBusqueda.ToLower()) || 
                                     (p.Descripcion != null && p.Descripcion.ToLower().Contains(terminoBusqueda.ToLower())));
        }

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
            .Include(p => p.IdVendedorNavigation)
            .Include(p => p.OfertasFlashes.Where(of => of.FechaInicio <= fechaActual && of.FechaFin >= fechaActual && !of.EstadoEliminado))
            .Include(p => p.PreciosGeolocalizados)
            .Where(p => ids.Contains(p.IdProducto))
            .ToListAsync();
    }

    public async Task<Producto?> ObtenerPorId(int id)
    {
        var fechaActual = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

        return await _context.Productos
            .Include(p => p.IdCategoriaNavigation)
            .Include(p => p.IdVendedorNavigation)
            .Include(p => p.OfertasFlashes.Where(of => of.FechaInicio <= fechaActual && of.FechaFin >= fechaActual && !of.EstadoEliminado))
            .Include(p => p.PreciosGeolocalizados)
            .FirstOrDefaultAsync(p => p.IdProducto == id);
    }

    public async Task<Dictionary<int, string>> ObtenerNombresUsuarios(List<int> idsUsuarios)
    {
        var usuarios = await _context.Usuarios
            .Where(u => idsUsuarios.Contains(u.IdUsuario))
            .Select(u => new { u.IdUsuario, NombreCompleto = $"{u.Nombre} {u.Apellido}".Trim() })
            .ToListAsync();

        return usuarios.ToDictionary(u => u.IdUsuario, u => u.NombreCompleto);
    }

    public async Task<List<Producto>> ObtenerProductosPorVendedorAsync(int idVendedor)
    {
        var fechaActual = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

        return await _context.Productos
            .Include(p => p.IdCategoriaNavigation)
            .Include(p => p.OfertasFlashes.Where(of => of.FechaInicio <= fechaActual && of.FechaFin >= fechaActual && !of.EstadoEliminado))
            .Include(p => p.PreciosGeolocalizados)
            .Where(p => p.IdVendedor == idVendedor && !p.EstadoEliminado)
            .OrderByDescending(p => p.FechaCreacion)
            .ToListAsync();
    }

    public async Task<Producto> AgregarProductoAsync(Producto producto)
    {
        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();
        return producto;
    }

    public async Task ActualizarProductoAsync(Producto producto)
    {
        _context.Productos.Update(producto);
        await _context.SaveChangesAsync();
    }

    public async Task<List<string>> ObtenerCodigosPaisDistintosAsync()
    {
        return await _context.PreciosGeolocalizados
            .Where(pg => !pg.EstadoEliminado)
            .Select(pg => pg.CodigoPais)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
    }
}
