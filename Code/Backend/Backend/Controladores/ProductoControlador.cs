using Backend.Servicios;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Controladores;

[ApiController]
[Route("[controller]")]
public class ProductoControlador : ControllerBase
{
    private readonly IProductoServicio _servicio;

    public ProductoControlador(IProductoServicio servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerProductos(
        [FromQuery] string? terminoBusqueda, 
        [FromQuery] List<int>? categorias, 
        [FromQuery] int pagina = 1)
    {
        try
        {
            if (pagina < 1) pagina = 1;

            var productos = await _servicio.BuscarProductosAsync(terminoBusqueda, categorias, pagina);

            if (productos.Count == 0)
            {
                return Ok(new { mensaje = "No se encontraron resultados." });
            }

            return Ok(productos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Ocurrió un error interno en el servidor: " + ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerProductoPorId(int id)
    {
        try
        {
            var producto = await _servicio.ObtenerProductoPorIdAsync(id);

            if (producto == null)
            {
                return NotFound(new { mensaje = "Producto no encontrado." });
            }

            return Ok(producto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Ocurrió un error interno en el servidor: " + ex.Message });
        }
    }
}
