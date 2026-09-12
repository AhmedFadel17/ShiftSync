namespace ShiftSync.API.DTOs.Attendances;

public record AttendanceResponseDto
{
    public int Id { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string UserFullName { get; init; } = string.Empty;
    public int UserShiftId { get; init; }
    public string ShiftName { get; init; } = string.Empty;
    public DateTime Date { get; init; }
    public DateTime CheckInTime { get; init; }
    public double CheckInLatitude { get; init; }
    public double CheckInLongitude { get; init; }
    public DateTime? CheckOutTime { get; init; }
    public double? CheckOutLatitude { get; init; }
    public double? CheckOutLongitude { get; init; }
    public bool IsCheckedOut => CheckOutTime.HasValue;
    public double? TotalHours => CheckOutTime.HasValue
        ? (CheckOutTime.Value - CheckInTime).TotalHours
        : null;
}
