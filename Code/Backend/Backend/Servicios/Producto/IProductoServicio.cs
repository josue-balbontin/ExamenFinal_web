using Backend.Modelos.ResponseDto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Servicios;

public interface IProductoServicio
{
    Task<List<ProductoResponseDto>> BuscarProductosAsync(string? terminoBusqueda, List<int>? categorias, int pagina);
    Task<ProductoResponseDto?> ObtenerProductoPorIdAsync(int idProducto);
    Task<ResenasProductoResponseDto> ObtenerResenasDeProductoAsync(int idProducto);
    Task AgregarResenaAsync(int idProducto, int idUsuario, Backend.Modelos.RequestDto.CrearResenaRequestDto request);
    Task<List<ProductoResponseDto>> ObtenerMisProductosAsync(int idVendedor);
}
