using System.Threading.Tasks;
using Backend.Modelos.RequestDto;

namespace Backend.Servicios.Pedido;

public interface IPedidoServicio
{
    Task<Modelos.Entidades.Pedido> CrearPedidoAsync(int idCliente, CrearPedidoRequestDto request);
}
