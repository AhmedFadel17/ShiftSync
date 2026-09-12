using Microsoft.EntityFrameworkCore;
using ShiftSync.API.Data;
using ShiftSync.API.DTOs.Attendances;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Repositories.Attendances;

public class AttendanceRepository : BaseRepository<Attendance>, IAttendanceRepository
{
    public AttendanceRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<PaginationSource<Attendance>> GetPagedAsync(AttendanceFilterDto filter, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(a => a.User)
            .Include(a => a.UserShift).ThenInclude(us => us.Shift)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.UserId))
            query = query.Where(a => a.UserId == filter.UserId);

        if (filter.UserShiftId.HasValue)
            query = query.Where(a => a.UserShiftId == filter.UserShiftId.Value);

        if (filter.FromDate.HasValue)
            query = query.Where(a => a.CheckInTime.Date >= filter.FromDate.Value.Date);

        if (filter.ToDate.HasValue)
            query = query.Where(a => a.CheckInTime.Date <= filter.ToDate.Value.Date);

        if (filter.IsCheckedOut.HasValue)
            query = filter.IsCheckedOut.Value
                ? query.Where(a => a.CheckOutTime != null)
                : query.Where(a => a.CheckOutTime == null);

        query = query.OrderByDescending(a => a.CheckInTime);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        return new PaginationSource<Attendance>(items, filter.PageNumber, filter.PageSize, totalCount);
    }

    public async Task<Attendance?> GetOpenAttendanceAsync(string userId, int userShiftId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(
            a => a.UserId == userId && a.UserShiftId == userShiftId && a.CheckOutTime == null,
            cancellationToken);
    }
}
