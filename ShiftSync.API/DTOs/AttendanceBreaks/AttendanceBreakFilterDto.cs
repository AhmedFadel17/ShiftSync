using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.DTOs.AttendanceBreaks;

public record AttendanceBreakFilterDto : BaseFilterDto
{
    public int? AttendanceId { get; init; }
    public int? BreakTypeId { get; init; }
    public BreakStatus? Status { get; init; }
}
