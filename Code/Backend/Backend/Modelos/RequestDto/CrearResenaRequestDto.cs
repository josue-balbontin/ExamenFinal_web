using System.ComponentModel.DataAnnotations;

namespace Backend.Modelos.RequestDto;

public class CrearResenaRequestDto
{
    [Required]
    [Range(1, 5, ErrorMessage = "La calificación debe estar entre 1 y 5 estrellas.")]
    public int Calificacion { get; set; }

    [Required]
    [StringLength(1000, ErrorMessage = "El comentario no puede exceder los 1000 caracteres.")]
    public string Comentario { get; set; } = string.Empty;
}
