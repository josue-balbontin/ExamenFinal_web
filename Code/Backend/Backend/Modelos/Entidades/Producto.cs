using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Backend.Modelos.Entidades;

public partial class Producto
{
    [JsonPropertyName("idProducto")]
    public int IdProducto { get; set; }

    public int IdVendedor { get; set; }

    public int IdCategoria { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public double PrecioBase { get; set; }

    public int Stock { get; set; }

    public string? UrlImagen { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool EstadoEliminado { get; set; }

    public virtual ICollection<DetallesPedido> DetallesPedidos { get; set; } = new List<DetallesPedido>();

    public virtual Categoria IdCategoriaNavigation { get; set; } = null!;

    public virtual Usuario IdVendedorNavigation { get; set; } = null!;

    public virtual ICollection<OfertasFlash> OfertasFlashes { get; set; } = new List<OfertasFlash>();

    public virtual ICollection<PreciosGeolocalizado> PreciosGeolocalizados { get; set; } = new List<PreciosGeolocalizado>();
}
