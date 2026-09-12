using Microsoft.EntityFrameworkCore;
using ShiftSync.API.Data;
using ShiftSync.API.DTOs.AttendanceBreaks;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.Repositories.AttendanceBreaks;

public class AttendanceBreakRepository : BaseRepository<AttendanceBreak>, IAttendanceBreakRepository
{
    public AttendanceBreakRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<PaginationSource<AttendanceBreak>> GetPagedAsync(AttendanceBreakFilterDto filter, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(ab => ab.BreakType)
            .AsQueryable();

        if (filter.AttendanceId.HasValue)
            query = query.Where(ab => ab.AttendanceId == filter.AttendanceId.Value);

        if (filter.BreakTypeId.HasValue)
            query = query.Where(ab => ab.BreakTypeId == filter.BreakTypeId.Value);

        if (filter.Status.HasValue)
            query = query.Where(ab => ab.Status == filter.Status.Value);

        query = query.OrderByDescending(ab => ab.RequestTime);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        return new PaginationSource<AttendanceBreak>(items, filter.PageNumber, filter.PageSize, totalCount);
    }

    public async Task<int> CountByTypeAsync(int attendanceId, int breakTypeId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(
            ab => ab.AttendanceId == attendanceId
               && ab.BreakTypeId == breakTypeId
               && ab.Status != BreakStatus.Rejected,
            cancellationToken);
    }

    public async Task<int> GetTotalBreakMinutesAsync(int attendanceId, CancellationToken cancellationToken = default)
    {
        var completedBreaks = await _dbSet
            .Where(ab => ab.AttendanceId == attendanceId && ab.Status == BreakStatus.Completed
                      && ab.StartTime.HasValue && ab.EndTime.HasValue)
            .ToListAsync(cancellationToken);

        return (int)completedBreaks.Sum(ab => (ab.EndTime!.Value - ab.StartTime!.Value).TotalMinutes);
    }

    public async Task<int> CountActiveBreaksForShiftAsync(int userShiftId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(ab => ab.Attendance)
            .CountAsync(ab => ab.Attendance.UserShiftId == userShiftId
                           && ab.Status == BreakStatus.Approved
                           && ab.EndTime == null,
                cancellationToken);
    }
}
