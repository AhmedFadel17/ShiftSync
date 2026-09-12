using ShiftSync.API.DTOs.Auth;

namespace ShiftSync.API.Services.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default);
}
