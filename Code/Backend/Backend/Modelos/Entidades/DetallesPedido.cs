using System;
using System.Collections.Generic;

namespace Backend.Modelos.Entidades;

public partial class DetallesPedido
{
    public int IdDetalle { get; set; }

    public int IdPedido { get; set; }

    public int IdProducto { get; set; }

    public int IdVendedor { get; set; }

    public int Cantidad { get; set; }

    public double PrecioUnitarioAplicado { get; set; }

    public double Subtotal { get; set; }

    public bool EstadoEliminado { get; set; }

    public virtual Pedido IdPedidoNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;

    public virtual Usuario IdVendedorNavigation { get; set; } = null!;
}
