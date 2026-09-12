using ShiftSync.API.DTOs.Common;

namespace ShiftSync.API.DTOs.UserShifts;

public record UserShiftFilterDto : BaseFilterDto
{
    public string? UserId { get; init; }
    public int? ShiftId { get; init; }
    public DateTime? Date { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}
