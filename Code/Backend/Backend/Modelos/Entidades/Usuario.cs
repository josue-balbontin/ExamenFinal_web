using System;
using System.Collections.Generic;

namespace Backend.Modelos.Entidades;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public int IdRol { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Telefono { get; set; }

    public string? DireccionPrincipal { get; set; }

    public DateTime FechaRegistro { get; set; }

    public bool EstadoEliminado { get; set; }

    public virtual ICollection<DetallesPedido> DetallesPedidos { get; set; } = new List<DetallesPedido>();

    public virtual Role IdRolNavigation { get; set; } = null!;

    public virtual ICollection<LiquidacionesVendedore> LiquidacionesVendedores { get; set; } = new List<LiquidacionesVendedore>();

    public virtual ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();

    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();

    public virtual ICollection<SolicitudesVendedor> SolicitudesVendedorIdRrhhAprobadorNavigations { get; set; } = new List<SolicitudesVendedor>();

    public virtual ICollection<SolicitudesVendedor> SolicitudesVendedorIdUsuarioNavigations { get; set; } = new List<SolicitudesVendedor>();
}
