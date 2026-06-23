using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Modelos.Entidades;

namespace Backend.Servicios.Notificacion;

public interface INotificacionServicio
{
    Task<List<Modelos.Entidades.Notificacion>> ObtenerTodasAsync(int idUsuario);
    Task<long> VerificarNoLeidasAsync(int idUsuario);
    Task MarcarTodasComoLeidasAsync(int idUsuario);
}
