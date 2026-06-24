using Backend.Modelos.RequestDto;
using Backend.Modelos.ResponseDto;

namespace Backend.Servicios.Carrito;

public interface ICarritoServicio
{
    Task<CarritoResponseDto> ObtenerCarritoAsync(int idUsuario);
    Task<CarritoResponseDto> AgregarAlCarritoAsync(int idUsuario, AgregarCarritoRequestDto request);
    Task<CarritoResponseDto> RemoverDelCarritoAsync(int idUsuario, int idProducto);
}
