namespace Backend.Modelos.RequestDto;

public class ResetPasswordRequestDto
{
    public string Token { get; set; } = null!;
    public string NuevoPassword { get; set; } = null!;
}
