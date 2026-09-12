using Microsoft.EntityFrameworkCore;
using ShiftSync.API.Data;
using ShiftSync.API.DTOs.BreakTypes;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Repositories.BreakTypes;

public class BreakTypeRepository : BaseRepository<BreakType>, IBreakTypeRepository
{
    public BreakTypeRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<PaginationSource<BreakType>> GetPagedAsync(BreakTypeFilterDto filter, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsQueryable();

        if (filter.IsActive.HasValue)
            query = query.Where(bt => bt.IsActive == filter.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            query = query.Where(bt => bt.Name.Contains(filter.SearchTerm));

        query = filter.OrderBy?.ToLower() switch
        {
            "name" => filter.SortOrder == "desc" ? query.OrderByDescending(bt => bt.Name) : query.OrderBy(bt => bt.Name),
            "maxduration" => filter.SortOrder == "desc" ? query.OrderByDescending(bt => bt.MaxDurationMinutes) : query.OrderBy(bt => bt.MaxDurationMinutes),
            _ => query.OrderBy(bt => bt.Id)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        return new PaginationSource<BreakType>(items, filter.PageNumber, filter.PageSize, totalCount);
    }

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(
            bt => bt.Name.ToLower() == name.ToLower() && (!excludeId.HasValue || bt.Id != excludeId.Value),
            cancellationToken);
    }

    public async Task<bool> HasAttendanceBreaksAsync(int breakTypeId, CancellationToken cancellationToken = default)
    {
        return await _context.AttendanceBreaks.AnyAsync(ab => ab.BreakTypeId == breakTypeId, cancellationToken);
    }
}
