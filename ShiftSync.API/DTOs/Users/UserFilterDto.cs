using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.DTOs.Users;

public record UserFilterDto : BaseFilterDto
{
    public UserRole? Role { get; set; }
    public bool? IsActive { get; set; }
}
