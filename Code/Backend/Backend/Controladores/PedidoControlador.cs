using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Modelos.RequestDto;
using Backend.Servicios.Pedido;

namespace Backend.Controladores;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Protegido, requiere token JWT
public class PedidoControlador : ControllerBase
{
    private readonly IPedidoServicio _pedidoServicio;

    public PedidoControlador(IPedidoServicio pedidoServicio)
    {
        _pedidoServicio = pedidoServicio;
    }

    [HttpPost]
    public async Task<IActionResult> CrearPedido([FromBody] CrearPedidoRequestDto request)
    {
        // Extraer el ID del usuario directamente del Token JWT por seguridad
        var idUsuarioStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idUsuarioStr, out int idCliente))
        {
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario comprador." });
        }

        try
        {
            var nuevoPedido = await _pedidoServicio.CrearPedidoAsync(idCliente, request);
            
            return CreatedAtAction(nameof(CrearPedido), new { id = nuevoPedido.IdPedido }, new 
            {
                mensaje = "Compra realizada con éxito",
                idPedido = nuevoPedido.IdPedido,
                totalPagado = nuevoPedido.TotalPagado
            });
        }
        catch (Exception ex)
        {
            // Devuelve error 400 (Bad Request) con el mensaje de la excepción (ej: falta de stock)
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}
