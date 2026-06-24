using System.Text.Json;
using Backend.Infrestructura.Conexion;
using Backend.Modelos.RequestDto;
using Backend.Modelos.ResponseDto;
using Microsoft.EntityFrameworkCore;

namespace Backend.Servicios.Carrito;

public class CarritoServicio : ICarritoServicio
{
    private readonly RedisContext _redisContext;
    private readonly MarketplaceDbContext _dbContext;

    public CarritoServicio(RedisContext redisContext, MarketplaceDbContext dbContext)
    {
        _redisContext = redisContext;
        _dbContext = dbContext;
    }

    private string GetCartKey(int userId) => $"carrito:usuario:{userId}";

    public async Task<CarritoResponseDto> ObtenerCarritoAsync(int idUsuario)
    {
        var db = _redisContext.Database;
        var json = await db.StringGetAsync(GetCartKey(idUsuario));

        if (json.IsNullOrEmpty)
        {
            return new CarritoResponseDto();
        }

        string jsonStr = json.ToString();
        return JsonSerializer.Deserialize<CarritoResponseDto>(jsonStr) ?? new CarritoResponseDto();
    }

    private async Task GuardarCarritoAsync(int idUsuario, CarritoResponseDto carrito)
    {
        var db = _redisContext.Database;
        var json = JsonSerializer.Serialize(carrito);
        // Expirar en 30 días
        await db.StringSetAsync(GetCartKey(idUsuario), json, TimeSpan.FromDays(30));
    }

    public async Task<CarritoResponseDto> AgregarAlCarritoAsync(int idUsuario, AgregarCarritoRequestDto request)
    {
        var carrito = await ObtenerCarritoAsync(idUsuario);

        var itemExistente = carrito.Items.FirstOrDefault(i => i.IdProducto == request.IdProducto);
        
        if (itemExistente != null)
        {
            itemExistente.Cantidad += request.Cantidad;
            if (itemExistente.Cantidad <= 0)
            {
                carrito.Items.Remove(itemExistente);
            }
        }
        else if (request.Cantidad > 0)
        {
            // Buscar datos del producto y vendedor en la DB
            var producto = await _dbContext.Productos
                .Include(p => p.IdVendedorNavigation)
                .FirstOrDefaultAsync(p => p.IdProducto == request.IdProducto && p.EstadoEliminado == false);

            if (producto == null)
            {
                throw new Exception("El producto no existe o está eliminado.");
            }

            carrito.Items.Add(new CarritoItemDto
            {
                IdProducto = producto.IdProducto,
                NombreProducto = producto.Nombre,
                UrlImagen = producto.UrlImagen ?? string.Empty,
                PrecioUnitario = producto.PrecioBase, // Asumimos precio base o deberíamos calcular ofertas
                Cantidad = request.Cantidad,
                IdVendedor = producto.IdVendedor,
                NombreVendedor = producto.IdVendedorNavigation.Nombre ?? "Vendedor Desconocido"
            });
        }

        await GuardarCarritoAsync(idUsuario, carrito);
        return carrito;
    }

    public async Task<CarritoResponseDto> RemoverDelCarritoAsync(int idUsuario, int idProducto)
    {
        var carrito = await ObtenerCarritoAsync(idUsuario);
        
        var item = carrito.Items.FirstOrDefault(i => i.IdProducto == idProducto);
        if (item != null)
        {
            carrito.Items.Remove(item);
            await GuardarCarritoAsync(idUsuario, carrito);
        }

        return carrito;
    }
}
