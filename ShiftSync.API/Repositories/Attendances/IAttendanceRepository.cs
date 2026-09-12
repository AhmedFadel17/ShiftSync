using ShiftSync.API.DTOs.Attendances;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Repositories.Attendances;

public interface IAttendanceRepository : IBaseRepository<Attendance>
{
    Task<PaginationSource<Attendance>> GetPagedAsync(AttendanceFilterDto filter, CancellationToken cancellationToken = default);
    Task<Attendance?> GetOpenAttendanceAsync(string userId, int userShiftId, CancellationToken cancellationToken = default);
}
