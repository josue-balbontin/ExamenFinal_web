namespace Backend.Modelos.ResponseDto;

public class ProductoResponseDto
{
    public int IdProducto { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public double PrecioBase { get; set; }
    public double PrecioAplicado { get; set; }
    public string UrlImagen { get; set; } = string.Empty;
    public int Stock { get; set; }
    public double PorcentajeDescuentoFlash { get; set; }
    public int IdCategoria { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string NombreVendedor { get; set; } = string.Empty;
    public double Estrellas { get; set; }
    public int CantidadReviews { get; set; }
}
