using System.Threading.Tasks;
using Backend.Modelos.RequestDto;

using Backend.Modelos.ResponseDto;

namespace Backend.Servicios.Auth;

public interface IAuthServicio
{
    Task RegistrarUsuarioAsync(RegistroRequestDto request);
    Task<UsuarioResponseDto> LoginAsync(LoginRequestDto request);
    Task<string?> SolicitarRecuperacionPasswordAsync(OlvidoPasswordRequestDto request);
    Task ResetearPasswordAsync(ResetPasswordRequestDto request);
    Task<UsuarioResponseDto> EditarPerfilAsync(int idUsuario, EditarPerfilRequestDto request);
}
