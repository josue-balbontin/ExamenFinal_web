using System;
using System.Collections.Generic;

namespace Backend.Modelos.Entidades;

public partial class LiquidacionesVendedore
{
    public int IdLiquidacion { get; set; }

    public int IdVendedor { get; set; }

    public DateTime FechaCorteInicio { get; set; }

    public DateTime FechaCorteFin { get; set; }

    public double MontoVentasTotal { get; set; }

    public double PorcentajeComisionPlataforma { get; set; }

    public double MontoComisionRetenida { get; set; }

    public double MontoAPagarVendedor { get; set; }

    public DateTime? FechaPago { get; set; }

    public bool EstadoEliminado { get; set; }

    public virtual Usuario IdVendedorNavigation { get; set; } = null!;
    
    public EstadoPagoComision Estado { get; set; }
}
