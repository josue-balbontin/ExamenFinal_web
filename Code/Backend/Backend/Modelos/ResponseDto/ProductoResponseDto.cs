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
    
    // Nueva información adicional para el panel y catálogo
    public OfertaFlashResponseDto? OfertaFlash { get; set; }
    public List<PrecioGeoResponseDto>? PreciosGeolocalizados { get; set; }
}

public class OfertaFlashResponseDto
{
    public double PorcentajeDescuento { get; set; }
    public System.DateTime FechaInicio { get; set; }
    public System.DateTime FechaFin { get; set; }
    public bool EstaActiva { get; set; }
}

public class PrecioGeoResponseDto
{
    public string CodigoPais { get; set; } = string.Empty;
    public double Multiplicador { get; set; }
}
