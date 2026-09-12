using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.Shifts;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Repositories.Shifts;

public interface IShiftRepository : IBaseRepository<Shift>
{
    Task<PaginationSource<Shift>> GetPagedAsync(ShiftFilterDto filter, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> HasActiveFutureAssignmentsAsync(int shiftId, CancellationToken cancellationToken = default);
}
