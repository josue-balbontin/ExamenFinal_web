using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.Modelos.RequestDto;
using Backend.Servicios.Auth;
using Backend.Modelos.ResponseDto;
using Microsoft.AspNetCore.Http;

namespace Backend.Controladores;

[ApiController]
[Route("Auth")]
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
    [ProducesResponseType(typeof(UsuarioResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { mensaje = "Email y contraseña son obligatorios" });

        try
        {
            Console.WriteLine($"[LOGIN] Email='{request.Email}' PasswordLength={request.Password?.Length} Password='{request.Password}'");
            request.Email = request.Email?.Trim();
            request.Password = request.Password?.Trim();
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

    [HttpPost("olvido-password")]
    public async Task<IActionResult> OlvidoPassword([FromBody] OlvidoPasswordRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { mensaje = "El correo es obligatorio" });

        try
        {
            var token = await _authServicio.SolicitarRecuperacionPasswordAsync(request);
            // Siempre retornamos OK por seguridad, independientemente de si el correo existe
            return Ok(new { mensaje = "Si el correo está registrado, recibirás un token de recuperación", token });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error interno del servidor: " + ex.Message });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NuevoPassword))
            return BadRequest(new { mensaje = "El token y la nueva contraseña son obligatorios" });

        if (request.NuevoPassword.Length < 6)
            return BadRequest(new { mensaje = "La nueva contraseña debe tener al menos 6 caracteres" });

        try
        {
            await _authServicio.ResetearPasswordAsync(request);
            return Ok(new { mensaje = "Contraseña actualizada exitosamente" });
        }
        catch (ArgumentException ex)
        {
            // Token inválido o expirado
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error interno del servidor: " + ex.Message });
        }
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPut("perfil")]
    public async Task<IActionResult> EditarPerfil([FromBody] EditarPerfilRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                              ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int idUsuario))
            {
                return Unauthorized(new { mensaje = "Token inválido o usuario no autenticado" });
            }

            var response = await _authServicio.EditarPerfilAsync(idUsuario, request);
            return Ok(new { mensaje = "Perfil actualizado exitosamente", usuario = response });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error interno del servidor: " + ex.Message });
        }
    }
}
