namespace ShiftSync.API.DTOs.BreakTypes;

public record BreakTypeResponseDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public int MaxDurationMinutes { get; init; }
    public int MaxOccurrencesPerShift { get; init; }
    public bool IsActive { get; init; }
}
