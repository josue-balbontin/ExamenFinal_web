using System;
using System.Collections.Generic;

namespace Backend.Modelos.Entidades;

public partial class SolicitudesVendedor
{
    public int IdSolicitud { get; set; }

    public int IdUsuario { get; set; }

    public int? IdRrhhAprobador { get; set; }

    public string? DocumentacionUrl { get; set; }

    public DateTime FechaSolicitud { get; set; }

    public DateTime? FechaResolucion { get; set; }

    public string? ObservacionesRrhh { get; set; }

    public bool EstadoEliminado { get; set; }

    public virtual Usuario? IdRrhhAprobadorNavigation { get; set; }

    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
    
    public EstadoSolicitud Estado { get; set; }
}
