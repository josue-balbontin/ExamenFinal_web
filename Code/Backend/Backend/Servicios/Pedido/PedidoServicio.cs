using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Infrestructura.Conexion;
using Backend.Modelos.Entidades;
using Backend.Modelos.RequestDto;
using Microsoft.EntityFrameworkCore;

namespace Backend.Servicios.Pedido;

public class PedidoServicio : IPedidoServicio
{
    private readonly MarketplaceDbContext _dbContext;

    public PedidoServicio(MarketplaceDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Modelos.Entidades.Pedido> CrearPedidoAsync(int idCliente, CrearPedidoRequestDto request)
    {
        if (request.Items == null || !request.Items.Any())
        {
            throw new Exception("El pedido debe contener al menos un producto.");
        }

        using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var nuevoPedido = new Modelos.Entidades.Pedido
            {
                IdCliente = idCliente,
                FechaPedido = DateTime.Now,
                DireccionEnvio = request.DireccionEnvio,
                MetodoPago = request.MetodoPago,
                Estado = EstadoPedido.pagado, // Como solicitó el usuario
                EstadoEliminado = false,
                TotalPagado = 0 // Se calculará sumando los subtotales
            };

            await _dbContext.Pedidos.AddAsync(nuevoPedido);
            await _dbContext.SaveChangesAsync(); // Para obtener el IdPedido

            double totalPedido = 0;

            foreach (var itemDto in request.Items)
            {
                var producto = await _dbContext.Productos
                    .FirstOrDefaultAsync(p => p.IdProducto == itemDto.IdProducto);

                if (producto == null)
                {
                    throw new Exception($"El producto con ID {itemDto.IdProducto} no existe.");
                }

                if (producto.Stock < itemDto.Cantidad)
                {
                    throw new Exception($"Stock insuficiente para el producto '{producto.Nombre}'. Stock disponible: {producto.Stock}, Solicitado: {itemDto.Cantidad}");
                }

                // Descontar stock
                producto.Stock -= itemDto.Cantidad;
                _dbContext.Productos.Update(producto);

                var subtotal = producto.PrecioBase * itemDto.Cantidad;
                totalPedido += subtotal;

                var detalle = new DetallesPedido
                {
                    IdPedido = nuevoPedido.IdPedido,
                    IdProducto = producto.IdProducto,
                    IdVendedor = producto.IdVendedor,
                    Cantidad = itemDto.Cantidad,
                    PrecioUnitarioAplicado = producto.PrecioBase,
                    Subtotal = subtotal,
                    EstadoEliminado = false
                };

                await _dbContext.DetallesPedidos.AddAsync(detalle);
            }

            nuevoPedido.TotalPagado = totalPedido;
            _dbContext.Pedidos.Update(nuevoPedido);

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return nuevoPedido;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw; // Relanza la excepción para que el controlador la maneje
        }
    }
}
