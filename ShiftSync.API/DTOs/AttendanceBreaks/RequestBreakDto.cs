namespace ShiftSync.API.DTOs.AttendanceBreaks;

public record RequestBreakDto
{
    public int AttendanceId { get; init; }
    public int BreakTypeId { get; init; }
    public string? Note { get; init; }
}
