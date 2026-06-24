namespace Backend.Modelos.RequestDto;

public class AgregarCarritoRequestDto
{
    public int IdProducto { get; set; }
    public int Cantidad { get; set; }
}

public class ActualizarCarritoRequestDto
{
    public int IdProducto { get; set; }
    public int Cantidad { get; set; }
}
