namespace ShiftSync.API.DTOs.Shifts;

public record CreateShiftDto
{
    public string Name { get; init; } = string.Empty;
    public TimeSpan StartTime { get; init; }
    public TimeSpan EndTime { get; init; }
    public int MaxAllowedBreaksDurationMinutes { get; init; } = 60;
    public int MinActiveEmployeesRequired { get; init; } = 2;
}
