using System.Threading.Tasks;

namespace Backend.Servicios.Email;

public interface IEmailServicio
{
    Task EnviarEmailAsync(string destino, string asunto, string cuerpoHtml);
}
