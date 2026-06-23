using Backend.Infrestructura.Conexion;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controladores;

[ApiController]
[Route("Categoria")]
public class CategoriaControlador : ControllerBase
{
    private readonly MarketplaceDbContext _context;

    public CategoriaControlador(MarketplaceDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerCategorias()
    {
        var categorias = await _context.Categorias
            .Where(c => !c.EstadoEliminado)
            .Select(c => new { c.IdCategoria, c.Nombre, c.Descripcion })
            .ToListAsync();

        return Ok(categorias);
    }
}
