using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Modelos.RequestDto;

public class EditarProductoRequestDto
{
    [Required(ErrorMessage = "El nombre del producto es obligatorio.")]
    [MaxLength(200, ErrorMessage = "El nombre no puede exceder los 200 caracteres.")]
    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    [Required(ErrorMessage = "El precio base es obligatorio.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "El precio base debe ser mayor a 0.")]
    public double? PrecioBase { get; set; }

    [Required(ErrorMessage = "El stock es obligatorio.")]
    [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo.")]
    public int? Stock { get; set; }

    public string? UrlImagen { get; set; }

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    public int IdCategoria { get; set; }

    /// <summary>
    /// Lista de precios geolocalizados para este producto.
    /// Si viene vacía se eliminan todos los precios geo existentes.
    /// </summary>
    public List<PrecioGeoDto>? PreciosGeolocalizados { get; set; }
}

public class PrecioGeoDto
{
    [Required(ErrorMessage = "El código de país es obligatorio.")]
    [MaxLength(5, ErrorMessage = "El código de país no puede exceder 5 caracteres.")]
    public string CodigoPais { get; set; } = null!;

    [Required(ErrorMessage = "El multiplicador es obligatorio.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "El multiplicador debe ser mayor a 0.")]
    public double Multiplicador { get; set; }
}
