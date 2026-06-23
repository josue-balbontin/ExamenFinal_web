using System;
using System.Threading.Tasks;
using Backend.Infrestructura.Conexion;
using Backend.Modelos.Entidades;
using Backend.Modelos.RequestDto;
using Backend.Modelos.ResponseDto;
using Backend.Infrestructura.Seguridad;
using Backend.Servicios.Email;
using StackExchange.Redis;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Servicios.Auth;

public class AuthServicio : IAuthServicio
{
    private readonly MarketplaceDbContext _dbContext;
    private readonly RedisContext _redisContext;
    private readonly IEmailServicio _emailServicio;

    public AuthServicio(MarketplaceDbContext dbContext, RedisContext redisContext, IEmailServicio emailServicio)
    {
        _dbContext = dbContext;
        _redisContext = redisContext;
        _emailServicio = emailServicio;
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
            Telefono = request.Telefono,
            DireccionPrincipal = request.Direccion,
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
            new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
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

    public async Task SolicitarRecuperacionPasswordAsync(OlvidoPasswordRequestDto request)
    {
        var usuario = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);
        
        if (usuario != null)
        {
            // Generar un token aleatorio
            string token = Guid.NewGuid().ToString("N");
            
            // Guardar en Redis: clave = reset_token:{token}, valor = email
            var dbRedis = _redisContext.Database;
            await dbRedis.StringSetAsync($"reset_token:{token}", request.Email, TimeSpan.FromMinutes(15));
            
            // Enviar correo
            string asunto = "Recuperación de Contraseña - Marketplace UGC";
            string cuerpoHtml = $@"
                <h3>Hola {usuario.Nombre},</h3>
                <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                <p>Tu token temporal de recuperación es: <strong>{token}</strong></p>
                <p>Este token expirará en 15 minutos.</p>
                <p>Si no fuiste tú, puedes ignorar este correo de forma segura.</p>";
            
            await _emailServicio.EnviarEmailAsync(request.Email, asunto, cuerpoHtml);
        }
        // Por seguridad, si el usuario es null no hacemos nada ni lanzamos error.
    }

    public async Task ResetearPasswordAsync(ResetPasswordRequestDto request)
    {
        var dbRedis = _redisContext.Database;
        string redisKey = $"reset_token:{request.Token}";
        var email = await dbRedis.StringGetAsync(redisKey);

        if (!email.HasValue)
        {
            throw new ArgumentException("El token es inválido o ha expirado.");
        }

        var usuario = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Email == email.ToString());
        if (usuario == null)
        {
            throw new ArgumentException("El token es inválido o ha expirado.");
        }

        // Hashear el nuevo password y guardar
        usuario.PasswordHash = DjangoPasswordHasher.HashPassword(request.NuevoPassword);
        await _dbContext.SaveChangesAsync();

        // Invalidar el token
        await dbRedis.KeyDeleteAsync(redisKey);
    }

    public async Task<UsuarioResponseDto> EditarPerfilAsync(int idUsuario, EditarPerfilRequestDto request)
    {
        var usuario = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.IdUsuario == idUsuario);
        if (usuario == null || usuario.EstadoEliminado)
        {
            throw new ArgumentException("Usuario no encontrado.");
        }

        // Si cambia el correo, validar que no exista ya en otro usuario
        if (usuario.Email != request.Email)
        {
            bool emailExiste = await _dbContext.Usuarios.AnyAsync(u => u.Email == request.Email && u.IdUsuario != idUsuario);
            if (emailExiste)
            {
                throw new ArgumentException("El correo ya está en uso por otro usuario.");
            }
        }

        usuario.Nombre = request.Nombre;
        usuario.Apellido = request.Apellido;
        usuario.Email = request.Email;
        usuario.Telefono = request.Telefono;
        usuario.DireccionPrincipal = request.Direccion;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            if (request.Password.Length < 6)
            {
                throw new ArgumentException("La nueva contraseña debe tener al menos 6 caracteres.");
            }
            usuario.PasswordHash = Backend.Infrestructura.Seguridad.DjangoPasswordHasher.HashPassword(request.Password);
        }

        await _dbContext.SaveChangesAsync();

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
            Token = string.Empty // No es necesario regenerar el token si no cambian los claims fundamentales o si el frontend no lo espera
        };
    }
}
