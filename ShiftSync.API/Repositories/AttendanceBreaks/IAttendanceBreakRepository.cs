using ShiftSync.API.DTOs.AttendanceBreaks;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Repositories.AttendanceBreaks;

public interface IAttendanceBreakRepository : IBaseRepository<AttendanceBreak>
{
    Task<PaginationSource<AttendanceBreak>> GetPagedAsync(AttendanceBreakFilterDto filter, CancellationToken cancellationToken = default);
    Task<int> CountByTypeAsync(int attendanceId, int breakTypeId, CancellationToken cancellationToken = default);
    Task<int> GetTotalBreakMinutesAsync(int attendanceId, CancellationToken cancellationToken = default);
    Task<int> CountActiveBreaksForShiftAsync(int userShiftId, CancellationToken cancellationToken = default);
}
