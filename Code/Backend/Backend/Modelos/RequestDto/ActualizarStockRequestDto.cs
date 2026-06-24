using System.ComponentModel.DataAnnotations;

namespace Backend.Modelos.RequestDto;

public class ActualizarStockRequestDto
{
    [Required(ErrorMessage = "El nuevo stock es obligatorio.")]
    [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo.")]
    public int Stock { get; set; }
}
