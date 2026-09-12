using ShiftSync.API.DTOs.BreakTypes;
using ShiftSync.API.DTOs.Common;

namespace ShiftSync.API.Services.BreakTypes;

public interface IBreakTypeService
{
    Task<PaginationSource<BreakTypeResponseDto>> GetPagedAsync(BreakTypeFilterDto filter, CancellationToken cancellationToken = default);
    Task<BreakTypeResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<BreakTypeResponseDto> CreateAsync(CreateBreakTypeDto dto, CancellationToken cancellationToken = default);
    Task<BreakTypeResponseDto> UpdateAsync(int id, UpdateBreakTypeDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
