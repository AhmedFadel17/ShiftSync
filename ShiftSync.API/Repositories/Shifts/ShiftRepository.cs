using Microsoft.EntityFrameworkCore;
using ShiftSync.API.Data;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.Shifts;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Repositories.Shifts;

public class ShiftRepository : BaseRepository<Shift>, IShiftRepository
{
    public ShiftRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<PaginationSource<Shift>> GetPagedAsync(ShiftFilterDto filter, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsQueryable();

        if (filter.IsActive.HasValue)
            query = query.Where(s => s.IsActive == filter.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            query = query.Where(s => s.Name.Contains(filter.SearchTerm));

        query = filter.OrderBy?.ToLower() switch
        {
            "name" => filter.SortOrder == "desc" ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
            "starttime" => filter.SortOrder == "desc" ? query.OrderByDescending(s => s.StartTime) : query.OrderBy(s => s.StartTime),
            _ => query.OrderBy(s => s.Id)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        return new PaginationSource<Shift>(items, filter.PageNumber, filter.PageSize, totalCount);
    }

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(
            s => s.Name.ToLower() == name.ToLower() && (!excludeId.HasValue || s.Id != excludeId.Value),
            cancellationToken);
    }

    public async Task<bool> HasActiveFutureAssignmentsAsync(int shiftId, CancellationToken cancellationToken = default)
    {
        return await _context.UserShifts.AnyAsync(
            us => us.ShiftId == shiftId && us.Date >= DateTime.UtcNow.Date,
            cancellationToken);
    }
}
