using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.DTOs.Users;

public record UserResponseDto
{
    public string Id { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public UserRole Role { get; init; } = UserRole.User;
    public bool IsActive { get; init; } = true;
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

}
