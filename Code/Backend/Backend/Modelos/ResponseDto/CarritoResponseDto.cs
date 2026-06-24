using System.Collections.Generic;
using System.Linq;

namespace Backend.Modelos.ResponseDto;

public class CarritoItemDto
{
    public int IdProducto { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string UrlImagen { get; set; } = string.Empty;
    public double PrecioUnitario { get; set; }
    public int Cantidad { get; set; }
    public double Subtotal => PrecioUnitario * Cantidad;
    public int IdVendedor { get; set; }
    public string NombreVendedor { get; set; } = string.Empty;
}

public class CarritoResponseDto
{
    public List<CarritoItemDto> Items { get; set; } = new();
    public double Total => Items.Sum(i => i.Subtotal);
}
