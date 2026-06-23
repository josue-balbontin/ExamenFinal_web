using System;
using System.Collections.Generic;

namespace Backend.Modelos.Entidades;

public partial class PreciosGeolocalizado
{
    public int IdPrecioGeo { get; set; }

    public int IdProducto { get; set; }

    public string CodigoPais { get; set; } = null!;

    public double Multiplicador { get; set; }

    public bool EstadoEliminado { get; set; }

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
