using System;
using System.Collections.Generic;

namespace Backend.Modelos.Entidades;

public partial class OfertasFlash
{
    public int IdOferta { get; set; }

    public int IdProducto { get; set; }

    public double PorcentajeDescuento { get; set; }

    public DateTime FechaInicio { get; set; }

    public DateTime FechaFin { get; set; }

    public bool EstadoEliminado { get; set; }

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
