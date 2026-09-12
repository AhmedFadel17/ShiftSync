using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.Models.Entities;

public class AttendanceBreak
{
    public int Id { get; set; }

    public int AttendanceId { get; set; }
    public Attendance Attendance { get; set; } = null!;

    public int BreakTypeId { get; set; }
    public BreakType BreakType { get; set; } = null!;

    public DateTime RequestTime { get; set; } = DateTime.UtcNow;
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }

    public BreakStatus Status { get; set; } = BreakStatus.Approved;

    public string? Note { get; set; }
}
