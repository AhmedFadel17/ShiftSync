using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.Shifts;

namespace ShiftSync.API.Services.Shifts;

public interface IShiftService
{
    Task<PaginationSource<ShiftResponseDto>> GetPagedAsync(ShiftFilterDto filter, CancellationToken cancellationToken = default);
    Task<ShiftResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ShiftResponseDto> CreateAsync(CreateShiftDto dto, CancellationToken cancellationToken = default);
    Task<ShiftResponseDto> UpdateAsync(int id, UpdateShiftDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
