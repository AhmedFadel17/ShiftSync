using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.DTOs.AttendanceBreaks;

public record AttendanceBreakResponseDto
{
    public int Id { get; init; }
    public int AttendanceId { get; init; }
    public int BreakTypeId { get; init; }
    public string BreakTypeName { get; init; } = string.Empty;
    public DateTime RequestTime { get; init; }
    public DateTime? StartTime { get; init; }
    public DateTime? EndTime { get; init; }
    public BreakStatus Status { get; init; }
    public string StatusName => Status.ToString();
    public string? Note { get; init; }
    public double? DurationMinutes => StartTime.HasValue && EndTime.HasValue
        ? (EndTime.Value - StartTime.Value).TotalMinutes
        : null;
}
