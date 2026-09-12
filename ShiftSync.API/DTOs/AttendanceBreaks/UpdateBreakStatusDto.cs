using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.DTOs.AttendanceBreaks;

public record UpdateBreakStatusDto
{
    public BreakStatus Status { get; init; }
    public string? Note { get; init; }
}
