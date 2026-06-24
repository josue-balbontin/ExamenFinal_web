using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Modelos.RequestDto;

public class ConfigurarOfertaFlashRequestDto : IValidatableObject
{
    [Required(ErrorMessage = "El porcentaje de descuento es obligatorio.")]
    [Range(1, 99, ErrorMessage = "El descuento debe estar entre 1% y 99%.")]
    public double PorcentajeDescuento { get; set; }

    [Required(ErrorMessage = "La fecha de inicio es obligatoria.")]
    public System.DateTime FechaInicio { get; set; }

    [Required(ErrorMessage = "La fecha de fin es obligatoria.")]
    public System.DateTime FechaFin { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (FechaFin <= FechaInicio)
        {
            yield return new ValidationResult(
                "La fecha de fin de la oferta debe ser posterior a la fecha de inicio.",
                new[] { nameof(FechaFin) }
            );
        }
    }
}
