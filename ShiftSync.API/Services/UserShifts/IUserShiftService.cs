using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.UserShifts;

namespace ShiftSync.API.Services.UserShifts;

public interface IUserShiftService
{
    Task<PaginationSource<UserShiftResponseDto>> GetPagedAsync(UserShiftFilterDto filter, CancellationToken cancellationToken = default);
    Task<UserShiftResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<UserShiftResponseDto> AssignAsync(AssignUserShiftDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
