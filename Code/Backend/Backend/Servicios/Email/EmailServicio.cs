using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Backend.Servicios.Email;

public class EmailServicio : IEmailServicio
{
    public async Task EnviarEmailAsync(string destino, string asunto, string cuerpoHtml)
    {
        var smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST");
        var smtpPortString = Environment.GetEnvironmentVariable("SMTP_PORT");
        var smtpUser = Environment.GetEnvironmentVariable("SMTP_USER");
        var smtpPass = Environment.GetEnvironmentVariable("SMTP_PASS");

        if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpPortString) || 
            string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
        {
            // Si no está configurado, podemos omitir o registrar el evento.
            // En un caso real se lanzaría un error o se usaría un servicio de fallback.
            Console.WriteLine("Advertencia: No se han configurado las variables SMTP. El correo no será enviado.");
            return;
        }

        if (!int.TryParse(smtpPortString, out int smtpPort))
        {
            smtpPort = 587;
        }

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUser, smtpPass),
            EnableSsl = true // Recomendado para casi todos los proveedores modernos
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(smtpUser, "Marketplace UGC"),
            Subject = asunto,
            Body = cuerpoHtml,
            IsBodyHtml = true
        };
        mailMessage.To.Add(destino);

        try
        {
            await client.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al enviar correo SMTP: {ex.Message}");
            // En desarrollo, no lanzamos la excepción para evitar romper el flujo si el SMTP no sirve.
        }
    }
}
