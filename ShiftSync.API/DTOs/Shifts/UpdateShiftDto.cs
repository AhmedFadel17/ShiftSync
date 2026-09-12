namespace ShiftSync.API.DTOs.Shifts;

public record UpdateShiftDto
{
    public string? Name { get; init; }
    public TimeSpan? StartTime { get; init; }
    public TimeSpan? EndTime { get; init; }
    public int? MaxAllowedBreaksDurationMinutes { get; init; }
    public int? MinActiveEmployeesRequired { get; init; }
    // public bool? IsActive { get; init; }
}
