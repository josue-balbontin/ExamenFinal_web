using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace Backend.Infrestructura.Seguridad;

public static class DjangoPasswordHasher
{
    /// <summary>
    /// Genera un hash PBKDF2 compatible nativamente con Django (pbkdf2_sha256).
    /// </summary>
    public static string HashPassword(string password)
    {
        int iterations = 600000; 
        
        var saltBytes = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(saltBytes);
        }
        string salt = Convert.ToBase64String(saltBytes)
                        .Replace("+", "")
                        .Replace("/", "")
                        .Replace("=", "");
        if (salt.Length > 22) salt = salt.Substring(0, 22);

        byte[] hash = KeyDerivation.Pbkdf2(
            password: password,
            salt: Encoding.UTF8.GetBytes(salt),
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: iterations,
            numBytesRequested: 32);

        string hashBase64 = Convert.ToBase64String(hash);
        
        return $"pbkdf2_sha256${iterations}${salt}${hashBase64}";
    }

    /// <summary>
    /// Verifica si una contraseña en texto plano coincide con el hash almacenado de Django.
    /// </summary>
    public static bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrEmpty(hashedPassword))
        {
            return false;
        }

        // Si la contraseña fue encriptada con BCrypt (empieza con $2a$, $2b$ o $2y$)
        if (hashedPassword.StartsWith("$2a$") || hashedPassword.StartsWith("$2b$") || hashedPassword.StartsWith("$2y$"))
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch
            {
                return false;
            }
        }

        if (!hashedPassword.StartsWith("pbkdf2_sha256$"))
        {
            return false;
        }

        string[] parts = hashedPassword.Split('$');
        if (parts.Length != 4)
        {
            return false;
        }

        if (!int.TryParse(parts[1], out int iterations))
        {
            return false;
        }

        string salt = parts[2];
        string originalHashBase64 = parts[3];

        byte[] hash = KeyDerivation.Pbkdf2(
            password: password,
            salt: Encoding.UTF8.GetBytes(salt),
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: iterations,
            numBytesRequested: 32);

        string computedHashBase64 = Convert.ToBase64String(hash);

        return originalHashBase64 == computedHashBase64;
    }
}
