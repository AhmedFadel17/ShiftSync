using Microsoft.AspNetCore.Identity;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.Models.Entities;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserShift> UserShifts { get; set; } = new List<UserShift>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
