using Backend.Modelos.Entidades;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Infrestructura.Repositorio;

public interface IProductoRepositorio
{
    Task<List<Producto>> ObtenerTodosPaginados(int pagina, int cantidadPorPagina, List<int>? categorias = null, string? terminoBusqueda = null);
    Task<List<Producto>> ObtenerPorIds(List<int> ids);
    Task<Producto?> ObtenerPorId(int id);
    Task<Dictionary<int, string>> ObtenerNombresUsuarios(List<int> idsUsuarios);
}
