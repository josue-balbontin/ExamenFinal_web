namespace Backend.Modelos.Entidades
{
    public enum EstadoPedido { pendiente, pagado, enviado, entregado, cancelado }
    public enum EstadoPagoComision { pendiente, pagado, en_disputa }
    public enum EstadoSolicitud { pendiente, aprobada, rechazada }
}