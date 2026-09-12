namespace ShiftSync.API.DTOs.BreakTypes;

public record UpdateBreakTypeDto
{
    public string? Name { get; init; }
    public int? MaxDurationMinutes { get; init; }
    public int? MaxOccurrencesPerShift { get; init; }
    public bool? IsActive { get; init; }
}
