using System;
using System.Collections.Generic;

namespace Backend.Modelos.Entidades;

public partial class Pedido
{
    public int IdPedido { get; set; }

    public int IdCliente { get; set; }

    public DateTime FechaPedido { get; set; }

    public double TotalPagado { get; set; }

    public string DireccionEnvio { get; set; } = null!;

    public string? MetodoPago { get; set; }

    public bool EstadoEliminado { get; set; }

    public virtual ICollection<DetallesPedido> DetallesPedidos { get; set; } = new List<DetallesPedido>();

    public virtual Usuario IdClienteNavigation { get; set; } = null!;
    
    public EstadoPedido Estado { get; set; }
    
}
