using Microsoft.EntityFrameworkCore;
using ShiftSync.API.Data;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.Users;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.Repositories.Users;

public class UserRepository : BaseRepository<ApplicationUser>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<PaginationSource<ApplicationUser>> GetPagedAsync(UserFilterDto filter, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsQueryable();

        if (filter.IsActive.HasValue)
            query = query.Where(s => s.IsActive == filter.IsActive.Value);
        if (filter.Role.HasValue)
            query = query.Where(s => s.Role == filter.Role.Value);


        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            query = query.Where(s => s.FullName.Contains(filter.SearchTerm));

        query = filter.OrderBy?.ToLower() switch
        {
            "name" => filter.SortOrder == "desc" ? query.OrderByDescending(s => s.FullName) : query.OrderBy(s => s.FullName),
            "email" => filter.SortOrder == "desc" ? query.OrderByDescending(s => s.Email) : query.OrderBy(s => s.Email),
            _ => query.OrderBy(s => s.Id)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        return new PaginationSource<ApplicationUser>(items, filter.PageNumber, filter.PageSize, totalCount);
    }
}
