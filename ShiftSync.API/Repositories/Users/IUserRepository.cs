using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.Users;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Repositories.Users;

public interface IUserRepository : IBaseRepository<ApplicationUser>
{
    Task<PaginationSource<ApplicationUser>> GetPagedAsync(UserFilterDto filter, CancellationToken cancellationToken = default);
}
