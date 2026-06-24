using System.ComponentModel.DataAnnotations;

namespace Backend.Modelos.RequestDto;

public class CrearProductoRequestDto
{
    [Required(ErrorMessage = "El nombre del producto es obligatorio.")]
    [MaxLength(200, ErrorMessage = "El nombre no puede exceder los 200 caracteres.")]
    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    [Required(ErrorMessage = "El precio base es obligatorio.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "El precio base debe ser mayor a 0.")]
    public double? PrecioBase { get; set; } // Nullable para que el [Required] actúe cuando viene vacío

    [Required(ErrorMessage = "El stock es obligatorio.")]
    [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo.")]
    public int? Stock { get; set; } // Nullable para validar requerimiento explícito

    public string? UrlImagen { get; set; }

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    public int IdCategoria { get; set; }
}
