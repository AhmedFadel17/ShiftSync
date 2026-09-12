namespace ShiftSync.API.DTOs.UserShifts;

public record AssignUserShiftDto
{
    public string UserId { get; init; } = string.Empty;
    public int ShiftId { get; init; }
    public DateTime Date { get; init; }
}
