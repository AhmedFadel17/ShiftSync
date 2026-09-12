using ShiftSync.API.DTOs.BreakTypes;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Repositories.BreakTypes;

public interface IBreakTypeRepository : IBaseRepository<BreakType>
{
    Task<PaginationSource<BreakType>> GetPagedAsync(BreakTypeFilterDto filter, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> HasAttendanceBreaksAsync(int breakTypeId, CancellationToken cancellationToken = default);
}
