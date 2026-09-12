using ShiftSync.API.DTOs.Common;

namespace ShiftSync.API.DTOs.Attendances;

public record AttendanceFilterDto : BaseFilterDto
{
    public string? UserId { get; init; }
    public int? UserShiftId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public bool? IsCheckedOut { get; init; }
}
