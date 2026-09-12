using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.UserShifts;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Repositories.UserShifts;

public interface IUserShiftRepository : IBaseRepository<UserShift>
{
    Task<PaginationSource<UserShift>> GetPagedAsync(UserShiftFilterDto filter, CancellationToken cancellationToken = default);
    Task<UserShift?> FindByUserShiftDateAsync(string userId, int shiftId, DateTime date, CancellationToken cancellationToken = default);
    Task<bool> HasAttendanceRecordsAsync(int userShiftId, CancellationToken cancellationToken = default);
}
