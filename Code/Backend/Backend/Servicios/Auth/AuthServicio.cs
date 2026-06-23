using System;
using System.Threading.Tasks;
using Backend.Infrestructura.Conexion;
using Backend.Modelos.Entidades;
using Backend.Modelos.RequestDto;
using Backend.Modelos.ResponseDto;
using Backend.Infrestructura.Seguridad;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Servicios.Auth;

public class AuthServicio : IAuthServicio
{
    private readonly MarketplaceDbContext _dbContext;

    public AuthServicio(MarketplaceDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task RegistrarUsuarioAsync(RegistroRequestDto request)
    {
        // 1. Validar si el email ya existe
        bool emailExiste = await _dbContext.Usuarios.AnyAsync(u => u.Email == request.Email);
        if (emailExiste)
        {
            throw new ArgumentException("El correo ya está en uso");
        }

        // 2. Hash de contraseña (compatible con pbkdf2_sha256 de Django)
        string hash = DjangoPasswordHasher.HashPassword(request.Password);

        // 3. Crear el nuevo usuario
        var nuevoUsuario = new Usuario
        {
            Nombre = request.Nombre,
            Apellido = request.Apellido,
            Email = request.Email,
            PasswordHash = hash,
            IdRol = 2, // 2 = Comprador/Usuario Regular (según configuración usual)
            FechaRegistro = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified),
            EstadoEliminado = false
        };

        _dbContext.Usuarios.Add(nuevoUsuario);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<UsuarioResponseDto> LoginAsync(LoginRequestDto request)
    {
        // 1. Buscar usuario por email
        var usuario = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);
        
        // 2. Verificar existencia y contraseña
        if (usuario == null || !DjangoPasswordHasher.VerifyPassword(request.Password, usuario.PasswordHash))
        {
            throw new UnauthorizedAccessException("Credenciales incorrectas");
        }

        // 3. Generar JWT
        string token = GenerarJwtToken(usuario);

        // 4. Retornar DTO sin contraseña
        return new UsuarioResponseDto
        {
            IdUsuario = usuario.IdUsuario,
            IdRol = usuario.IdRol,
            Nombre = usuario.Nombre,
            Apellido = usuario.Apellido,
            Email = usuario.Email,
            Telefono = usuario.Telefono,
            DireccionPrincipal = usuario.DireccionPrincipal,
            FechaRegistro = usuario.FechaRegistro,
            Token = token
        };
    }

    private string GenerarJwtToken(Usuario usuario)
    {
        var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? "super-secret-key-that-should-be-at-least-32-bytes-long-for-hmac-sha256";
        var key = Encoding.UTF8.GetBytes(jwtSecret);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.IdUsuario.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, usuario.Email),
            new Claim("rol", usuario.IdRol.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(24),
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
