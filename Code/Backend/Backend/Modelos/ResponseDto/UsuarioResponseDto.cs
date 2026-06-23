using System;

namespace Backend.Modelos.ResponseDto;

public class UsuarioResponseDto
{
    public int IdUsuario { get; set; }
    public int IdRol { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? DireccionPrincipal { get; set; }
    public DateTime FechaRegistro { get; set; }
    public string Token { get; set; } = string.Empty;
}
