using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Servicios.Notificacion;

namespace Backend.Controladores;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Protegido, requiere token JWT
public class NotificacionesControlador : ControllerBase
{
    private readonly INotificacionServicio _notificacionServicio;

    public NotificacionesControlador(INotificacionServicio notificacionServicio)
    {
        _notificacionServicio = notificacionServicio;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerNotificaciones()
    {
        var idUsuarioStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idUsuarioStr, out int idUsuario))
        {
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
        }

        var notificaciones = await _notificacionServicio.ObtenerTodasAsync(idUsuario);
        return Ok(notificaciones);
    }

    [HttpGet("hay-pendientes")]
    public async Task<IActionResult> VerificarPendientes()
    {
        var idUsuarioStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idUsuarioStr, out int idUsuario))
        {
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
        }

        var cantidadNoLeidas = await _notificacionServicio.VerificarNoLeidasAsync(idUsuario);
        return Ok(new 
        { 
            hayPendientes = cantidadNoLeidas > 0,
            cantidad = cantidadNoLeidas
        });
    }

    [HttpPut("leer-todas")]
    public async Task<IActionResult> LeerTodas()
    {
        var idUsuarioStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idUsuarioStr, out int idUsuario))
        {
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
        }

        await _notificacionServicio.MarcarTodasComoLeidasAsync(idUsuario);
        return Ok(new { mensaje = "Todas las notificaciones han sido marcadas como leídas." });
    }
}
