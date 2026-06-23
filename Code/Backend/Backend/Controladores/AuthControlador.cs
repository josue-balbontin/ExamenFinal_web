using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.Modelos.RequestDto;
using Backend.Servicios.Auth;

namespace Backend.Controladores;

[ApiController]
[Route("api/[controller]")]
public class AuthControlador : ControllerBase
{
    private readonly IAuthServicio _authServicio;

    public AuthControlador(IAuthServicio authServicio)
    {
        _authServicio = authServicio;
    }

    [HttpPost("registro")]
    public async Task<IActionResult> RegistrarUsuario([FromBody] RegistroRequestDto request)
    {
        if (request == null)
            return BadRequest(new { mensaje = "Datos inválidos" });

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { mensaje = "Email y contraseña son obligatorios" });

        if (request.Password.Length < 6)
            return BadRequest(new { mensaje = "La contraseña debe tener al menos 6 caracteres" });

        try
        {
            await _authServicio.RegistrarUsuarioAsync(request);
            return Ok(new { mensaje = "Usuario registrado exitosamente" });
        }
        catch (ArgumentException ex)
        {
            // El servicio lanza ArgumentException si el correo ya está en uso
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { mensaje = "Error interno del servidor" });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { mensaje = "Email y contraseña son obligatorios" });

        try
        {
            var response = await _authServicio.LoginAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { mensaje = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { mensaje = "Error interno del servidor" });
        }
    }
}
