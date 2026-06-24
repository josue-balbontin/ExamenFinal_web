using System.Security.Claims;
using Backend.Modelos.RequestDto;
using Backend.Modelos.ResponseDto;
using Backend.Servicios.Carrito;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controladores;

[ApiController]
[Route("[controller]")]
[Authorize]
public class CarritoControlador : ControllerBase
{
    private readonly ICarritoServicio _carritoServicio;

    public CarritoControlador(ICarritoServicio carritoServicio)
    {
        _carritoServicio = carritoServicio;
    }

    private int ObtenerIdUsuarioAuth()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out var id)) return id;
        throw new UnauthorizedAccessException("Usuario no autenticado");
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerCarrito()
    {
        try
        {
            var userId = ObtenerIdUsuarioAuth();
            var carrito = await _carritoServicio.ObtenerCarritoAsync(userId);
            return Ok(carrito);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpPost("agregar")]
    public async Task<IActionResult> AgregarAlCarrito([FromBody] AgregarCarritoRequestDto request)
    {
        try
        {
            var userId = ObtenerIdUsuarioAuth();
            var carrito = await _carritoServicio.AgregarAlCarritoAsync(userId, request);
            return Ok(carrito);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpDelete("remover/{idProducto}")]
    public async Task<IActionResult> RemoverDelCarrito(int idProducto)
    {
        try
        {
            var userId = ObtenerIdUsuarioAuth();
            var carrito = await _carritoServicio.RemoverDelCarritoAsync(userId, idProducto);
            return Ok(carrito);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}
