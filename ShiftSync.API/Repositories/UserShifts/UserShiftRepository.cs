using Microsoft.EntityFrameworkCore;
using ShiftSync.API.Data;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.UserShifts;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Repositories.UserShifts;

public class UserShiftRepository : BaseRepository<UserShift>, IUserShiftRepository
{
    public UserShiftRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<PaginationSource<UserShift>> GetPagedAsync(UserShiftFilterDto filter, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(us => us.User)
            .Include(us => us.Shift)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.UserId))
            query = query.Where(us => us.UserId == filter.UserId);

        if (filter.ShiftId.HasValue)
            query = query.Where(us => us.ShiftId == filter.ShiftId.Value);

        if (filter.Date.HasValue)
            query = query.Where(us => us.Date.Date == filter.Date.Value.Date);

        if (filter.FromDate.HasValue)
            query = query.Where(us => us.Date.Date >= filter.FromDate.Value.Date);

        if (filter.ToDate.HasValue)
            query = query.Where(us => us.Date.Date <= filter.ToDate.Value.Date);

        query = query.OrderByDescending(us => us.Date).ThenBy(us => us.ShiftId);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        return new PaginationSource<UserShift>(items, filter.PageNumber, filter.PageSize, totalCount);
    }

    public async Task<UserShift?> FindByUserShiftDateAsync(string userId, int shiftId, DateTime date, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(
            us => us.UserId == userId && us.ShiftId == shiftId && us.Date.Date == date.Date,
            cancellationToken);
    }

    public async Task<bool> HasAttendanceRecordsAsync(int userShiftId, CancellationToken cancellationToken = default)
    {
        return await _context.Attendances.AnyAsync(a => a.UserShiftId == userShiftId, cancellationToken);
    }
}
