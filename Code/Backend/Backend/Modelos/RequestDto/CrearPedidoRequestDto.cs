using System.Collections.Generic;

namespace Backend.Modelos.RequestDto;

public class CrearPedidoRequestDto
{
    public string DireccionEnvio { get; set; } = null!;
    public string? MetodoPago { get; set; }
    public List<ItemPedidoDto> Items { get; set; } = new List<ItemPedidoDto>();
}

public class ItemPedidoDto
{
    public int IdProducto { get; set; }
    public int Cantidad { get; set; }
}
