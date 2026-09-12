using ShiftSync.API.DTOs.Shifts;

namespace ShiftSync.API.DTOs.UserShifts;

public record UserShiftResponseDto
{
    public int Id { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string UserFullName { get; init; } = string.Empty;
    public int ShiftId { get; init; }
    public string ShiftName { get; init; } = string.Empty;
    public TimeSpan ShiftStartTime { get; init; }
    public TimeSpan ShiftEndTime { get; init; }
    public DateTime Date { get; init; }
}
