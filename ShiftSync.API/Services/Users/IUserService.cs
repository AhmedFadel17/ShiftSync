using ShiftSync.API.DTOs;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.Users;
using ShiftSync.API.DTOs.UserShifts;

namespace ShiftSync.API.Services.Users;

public interface IUserService
{
    Task<PaginationSource<UserResponseDto>> GetPagedAsync(UserFilterDto filter, CancellationToken cancellationToken = default);
    Task<UserResponseDto> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task DeleteAsync(string id, CancellationToken cancellationToken);
}
