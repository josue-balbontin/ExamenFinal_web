using Backend.Servicios;
using Backend.Modelos.RequestDto;
using Backend.Modelos.ResponseDto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Controladores;

[ApiController]
[Route("Producto")]
public class ProductoControlador : ControllerBase
{
    private readonly IProductoServicio _servicio;

    public ProductoControlador(IProductoServicio servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductoResponseDto>), StatusCodes.Status200OK)]
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

    [HttpGet("{id}", Name = nameof(ObtenerProductoPorId))]
    [ProducesResponseType(typeof(ProductoResponseDto), StatusCodes.Status200OK)]
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

    [HttpGet("{id}/reviews")]
    [ProducesResponseType(typeof(ResenasProductoResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerResenasDeProducto(int id)
    {
        try
        {
            var resenas = await _servicio.ObtenerResenasDeProductoAsync(id);
            return Ok(resenas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Ocurrió un error interno en el servidor: " + ex.Message });
        }
    }

    [HttpPost("{id}/reviews")]
    [Authorize]
    public async Task<IActionResult> AgregarResena(int id, [FromBody] CrearResenaRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int idUsuario))
        {
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
        }

        try
        {
            await _servicio.AgregarResenaAsync(id, idUsuario, request);
            return Ok(new { mensaje = "Reseña guardada exitosamente." });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Ocurrió un error interno en el servidor: " + ex.Message });
        }
    }

    [HttpGet("mis-productos")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<ProductoResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerMisProductos()
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int idUsuario))
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
            }

            var productos = await _servicio.ObtenerMisProductosAsync(idUsuario);

            // Devolver 200 OK con arreglo vacío si no hay productos (el frontend maneja el mensaje)
            return Ok(productos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Ocurrió un error interno en el servidor: " + ex.Message });
        }
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ProductoResponseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CrearProducto([FromBody] CrearProductoRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int idUsuario))
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
            }

            var productoCreado = await _servicio.CrearProductoAsync(idUsuario, request);
            return CreatedAtAction(nameof(ObtenerProductoPorId), new { id = productoCreado.IdProducto }, productoCreado);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Ocurrió un error interno en el servidor: " + ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ProductoResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> EditarProducto(int id, [FromBody] EditarProductoRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int idUsuario))
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
            }

            var productoActualizado = await _servicio.EditarProductoAsync(idUsuario, id, request);
            return Ok(new { mensaje = "Producto actualizado exitosamente.", producto = productoActualizado });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { mensaje = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Ocurrió un error interno en el servidor: " + ex.Message });
        }
    }

    [HttpPost("{id}/oferta-flash")]
    [Authorize]
    public async Task<IActionResult> ConfigurarOfertaFlash(int id, [FromBody] ConfigurarOfertaFlashRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int idUsuario))
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
            }

            await _servicio.ConfigurarOfertaFlashAsync(idUsuario, id, request);
            return Ok(new { mensaje = "Oferta flash configurada exitosamente." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { mensaje = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Ocurrió un error interno en el servidor: " + ex.Message });
        }
    }

    [HttpGet("codigos-pais")]
    public async Task<IActionResult> ObtenerCodigosPais()
    {
        try
        {
            var codigos = await _servicio.ObtenerCodigosPaisAsync();
            return Ok(codigos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Ocurrió un error interno en el servidor: " + ex.Message });
        }
    }
}
