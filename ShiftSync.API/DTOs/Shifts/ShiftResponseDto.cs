namespace ShiftSync.API.DTOs.Shifts;

public record ShiftResponseDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public TimeSpan StartTime { get; init; }
    public TimeSpan EndTime { get; init; }
    public double DurationHours { get; init; }
    public int MaxAllowedBreaksDurationMinutes { get; init; }
    public int MinActiveEmployeesRequired { get; init; }
    public bool IsActive { get; init; }
}
