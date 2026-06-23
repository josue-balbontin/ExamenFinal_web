using System;
using System.Collections.Generic;

namespace Backend.Modelos.ResponseDto;

public class ResenasProductoResponseDto
{
    public double PromedioEstrellas { get; set; }
    public int TotalReviews { get; set; }
    public DistribucionEstrellasDto Distribucion { get; set; } = new DistribucionEstrellasDto();
    public List<ComentarioDto> Comentarios { get; set; } = new List<ComentarioDto>();
}

public class DistribucionEstrellasDto
{
    public int CincoEstrellas { get; set; }
    public int CuatroEstrellas { get; set; }
    public int TresEstrellas { get; set; }
    public int DosEstrellas { get; set; }
    public int UnaEstrella { get; set; }
}

public class ComentarioDto
{
    public string NombreUsuario { get; set; } = string.Empty;
    public int Calificacion { get; set; }
    public string Comentario { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}
