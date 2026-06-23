using Backend.Modelos.Entidades;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrestructura.Conexion;

public partial class MarketplaceDbContext : DbContext
{
    public MarketplaceDbContext()
    {
    }

    public MarketplaceDbContext(DbContextOptions<MarketplaceDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Categoria> Categorias { get; set; }

    public virtual DbSet<DetallesPedido> DetallesPedidos { get; set; }

    public virtual DbSet<LiquidacionesVendedore> LiquidacionesVendedores { get; set; }

    public virtual DbSet<OfertasFlash> OfertasFlashes { get; set; }

    public virtual DbSet<Pedido> Pedidos { get; set; }

    public virtual DbSet<PreciosGeolocalizado> PreciosGeolocalizados { get; set; }

    public virtual DbSet<Producto> Productos { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<SolicitudesVendedor> SolicitudesVendedors { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            DotNetEnv.Env.TraversePath().Load(".env.development");
            var pgUser = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
            var pgPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "postgres";
            var pgDb = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "postgres";
            var pgPort = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
            var pgHost = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";

            var pgConnStr = $"Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password={pgPass}";
            
            var dataSourceBuilder = new Npgsql.NpgsqlDataSourceBuilder(pgConnStr);
            dataSourceBuilder.MapEnum<EstadoPedido>("esquema_marketplace.estado_pedido");
            dataSourceBuilder.MapEnum<EstadoPagoComision>("esquema_marketplace.estado_pago_comision");
            dataSourceBuilder.MapEnum<EstadoSolicitud>("esquema_marketplace.estado_solicitud");
            var dataSource = dataSourceBuilder.Build();

            optionsBuilder.UseNpgsql(dataSource, o => 
            {
                o.MapEnum<EstadoPedido>("esquema_marketplace.estado_pedido");
                o.MapEnum<EstadoPagoComision>("esquema_marketplace.estado_pago_comision");
                o.MapEnum<EstadoSolicitud>("esquema_marketplace.estado_solicitud");
            });
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresEnum<EstadoPedido>("esquema_marketplace", "estado_pedido");
        modelBuilder.HasPostgresEnum<EstadoPagoComision>("esquema_marketplace", "estado_pago_comision");
        modelBuilder.HasPostgresEnum<EstadoSolicitud>("esquema_marketplace", "estado_solicitud");

        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasKey(e => e.IdCategoria).HasName("categorias_pkey");

            entity.ToTable("categorias", "esquema_marketplace");

            entity.HasIndex(e => e.Nombre, "categorias_nombre_key").IsUnique();

            entity.Property(e => e.IdCategoria)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_categoria");
            entity.Property(e => e.Descripcion).HasColumnName("descripcion");
            entity.Property(e => e.EstadoEliminado).HasColumnName("estado_eliminado");
            entity.Property(e => e.Nombre)
                .HasMaxLength(255)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<DetallesPedido>(entity =>
        {
            entity.HasKey(e => e.IdDetalle).HasName("detalles_pedido_pkey");

            entity.ToTable("detalles_pedido", "esquema_marketplace");

            entity.Property(e => e.IdDetalle)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_detalle");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.EstadoEliminado).HasColumnName("estado_eliminado");
            entity.Property(e => e.IdPedido).HasColumnName("id_pedido");
            entity.Property(e => e.IdProducto).HasColumnName("id_producto");
            entity.Property(e => e.IdVendedor).HasColumnName("id_vendedor");
            entity.Property(e => e.PrecioUnitarioAplicado).HasColumnName("precio_unitario_aplicado");
            entity.Property(e => e.Subtotal).HasColumnName("subtotal");

            entity.HasOne(d => d.IdPedidoNavigation).WithMany(p => p.DetallesPedidos)
                .HasForeignKey(d => d.IdPedido)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("detalles_pedido_id_pedido_fkey");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.DetallesPedidos)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("detalles_pedido_id_producto_fkey");

            entity.HasOne(d => d.IdVendedorNavigation).WithMany(p => p.DetallesPedidos)
                .HasForeignKey(d => d.IdVendedor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("detalles_pedido_id_vendedor_fkey");
        });

        modelBuilder.Entity<LiquidacionesVendedore>(entity =>
        {
            entity.HasKey(e => e.IdLiquidacion).HasName("liquidaciones_vendedores_pkey");

            entity.ToTable("liquidaciones_vendedores", "esquema_marketplace");

            entity.Property(e => e.IdLiquidacion)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_liquidacion");
            entity.Property(e => e.EstadoEliminado).HasColumnName("estado_eliminado");
            entity.Property(e => e.FechaCorteFin)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_corte_fin");
            entity.Property(e => e.FechaCorteInicio)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_corte_inicio");
            entity.Property(e => e.FechaPago)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_pago");
            entity.Property(e => e.IdVendedor).HasColumnName("id_vendedor");
            entity.Property(e => e.MontoAPagarVendedor).HasColumnName("monto_a_pagar_vendedor");
            entity.Property(e => e.MontoComisionRetenida).HasColumnName("monto_comision_retenida");
            entity.Property(e => e.MontoVentasTotal).HasColumnName("monto_ventas_total");
            entity.Property(e => e.PorcentajeComisionPlataforma).HasColumnName("porcentaje_comision_plataforma");

            entity.HasOne(d => d.IdVendedorNavigation).WithMany(p => p.LiquidacionesVendedores)
                .HasForeignKey(d => d.IdVendedor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("liquidaciones_vendedores_id_vendedor_fkey");
        });

        modelBuilder.Entity<OfertasFlash>(entity =>
        {
            entity.HasKey(e => e.IdOferta).HasName("ofertas_flash_pkey");

            entity.ToTable("ofertas_flash", "esquema_marketplace");

            entity.Property(e => e.IdOferta)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_oferta");
            entity.Property(e => e.EstadoEliminado).HasColumnName("estado_eliminado");
            entity.Property(e => e.FechaFin)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_fin");
            entity.Property(e => e.FechaInicio)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_inicio");
            entity.Property(e => e.IdProducto).HasColumnName("id_producto");
            entity.Property(e => e.PorcentajeDescuento).HasColumnName("porcentaje_descuento");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.OfertasFlashes)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ofertas_flash_id_producto_fkey");
        });

        modelBuilder.Entity<Pedido>(entity =>
        {
            entity.HasKey(e => e.IdPedido).HasName("pedidos_pkey");

            entity.ToTable("pedidos", "esquema_marketplace");

            entity.Property(e => e.IdPedido)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_pedido");
            entity.Property(e => e.DireccionEnvio).HasColumnName("direccion_envio");
            entity.Property(e => e.EstadoEliminado).HasColumnName("estado_eliminado");
            entity.Property(e => e.FechaPedido)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_pedido");
            entity.Property(e => e.IdCliente).HasColumnName("id_cliente");
            entity.Property(e => e.MetodoPago)
                .HasMaxLength(50)
                .HasColumnName("metodo_pago");
            entity.Property(e => e.TotalPagado).HasColumnName("total_pagado");
            entity.Property(e => e.Estado).HasColumnName("estado");

            entity.HasOne(d => d.IdClienteNavigation).WithMany(p => p.Pedidos)
                .HasForeignKey(d => d.IdCliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("pedidos_id_cliente_fkey");
        });

        modelBuilder.Entity<PreciosGeolocalizado>(entity =>
        {
            entity.HasKey(e => e.IdPrecioGeo).HasName("precios_geolocalizados_pkey");

            entity.ToTable("precios_geolocalizados", "esquema_marketplace");

            entity.HasIndex(e => new { e.IdProducto, e.CodigoPais }, "unique_producto_pais").IsUnique();

            entity.Property(e => e.IdPrecioGeo)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_precio_geo");
            entity.Property(e => e.CodigoPais)
                .HasMaxLength(5)
                .HasColumnName("codigo_pais");
            entity.Property(e => e.EstadoEliminado).HasColumnName("estado_eliminado");
            entity.Property(e => e.IdProducto).HasColumnName("id_producto");
            entity.Property(e => e.Multiplicador).HasColumnName("multiplicador");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.PreciosGeolocalizados)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("precios_geolocalizados_id_producto_fkey");
        });

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(e => e.IdProducto).HasName("productos_pkey");

            entity.ToTable("productos", "esquema_marketplace");

            entity.Property(e => e.IdProducto)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_producto");
            entity.Property(e => e.Descripcion).HasColumnName("descripcion");
            entity.Property(e => e.EstadoEliminado).HasColumnName("estado_eliminado");
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_creacion");
            entity.Property(e => e.IdCategoria).HasColumnName("id_categoria");
            entity.Property(e => e.IdVendedor).HasColumnName("id_vendedor");
            entity.Property(e => e.Nombre)
                .HasMaxLength(255)
                .HasColumnName("nombre");
            entity.Property(e => e.PrecioBase).HasColumnName("precio_base");
            entity.Property(e => e.Stock).HasColumnName("stock");
            entity.Property(e => e.UrlImagen).HasColumnName("url_imagen");

            entity.HasOne(d => d.IdCategoriaNavigation).WithMany(p => p.Productos)
                .HasForeignKey(d => d.IdCategoria)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("productos_id_categoria_fkey");

            entity.HasOne(d => d.IdVendedorNavigation).WithMany(p => p.Productos)
                .HasForeignKey(d => d.IdVendedor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("productos_id_vendedor_fkey");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.IdRol).HasName("roles_pkey");

            entity.ToTable("roles", "esquema_usuarios");

            entity.HasIndex(e => e.Nombre, "roles_nombre_key").IsUnique();

            entity.Property(e => e.IdRol)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_rol");
            entity.Property(e => e.Descripcion).HasColumnName("descripcion");
            entity.Property(e => e.EstadoEliminado).HasColumnName("estado_eliminado");
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<SolicitudesVendedor>(entity =>
        {
            entity.HasKey(e => e.IdSolicitud).HasName("solicitudes_vendedor_pkey");

            entity.ToTable("solicitudes_vendedor", "esquema_marketplace");

            entity.Property(e => e.IdSolicitud)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_solicitud");
            entity.Property(e => e.DocumentacionUrl).HasColumnName("documentacion_url");
            entity.Property(e => e.EstadoEliminado).HasColumnName("estado_eliminado");
            entity.Property(e => e.FechaResolucion)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_resolucion");
            entity.Property(e => e.FechaSolicitud)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_solicitud");
            entity.Property(e => e.IdRrhhAprobador).HasColumnName("id_rrhh_aprobador");
            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.ObservacionesRrhh).HasColumnName("observaciones_rrhh");

            entity.HasOne(d => d.IdRrhhAprobadorNavigation).WithMany(p => p.SolicitudesVendedorIdRrhhAprobadorNavigations)
                .HasForeignKey(d => d.IdRrhhAprobador)
                .HasConstraintName("solicitudes_vendedor_id_rrhh_aprobador_fkey");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.SolicitudesVendedorIdUsuarioNavigations)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("solicitudes_vendedor_id_usuario_fkey");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("usuarios_pkey");

            entity.ToTable("usuarios", "esquema_usuarios");

            entity.HasIndex(e => e.Email, "usuarios_email_key").IsUnique();

            entity.Property(e => e.IdUsuario)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id_usuario");
            entity.Property(e => e.Apellido)
                .HasMaxLength(100)
                .HasColumnName("apellido");
            entity.Property(e => e.DireccionPrincipal).HasColumnName("direccion_principal");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.EstadoEliminado).HasColumnName("estado_eliminado");
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_registro");
            entity.Property(e => e.IdRol).HasColumnName("id_rol");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .HasColumnName("nombre");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.Telefono)
                .HasMaxLength(32)
                .HasColumnName("telefono");

            entity.HasOne(d => d.IdRolNavigation).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.IdRol)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("usuarios_id_rol_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
