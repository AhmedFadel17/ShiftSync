namespace ShiftSync.API.Models.Entities;

public class Attendance
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    public int UserShiftId { get; set; }
    public UserShift UserShift { get; set; } = null!;

    public DateTime CheckInTime { get; set; }
    public double CheckInLatitude { get; set; }
    public double CheckInLongitude { get; set; }

    public DateTime? CheckOutTime { get; set; }
    public double? CheckOutLatitude { get; set; }
    public double? CheckOutLongitude { get; set; }

    public ICollection<AttendanceBreak> Breaks { get; set; } = new List<AttendanceBreak>();
}
