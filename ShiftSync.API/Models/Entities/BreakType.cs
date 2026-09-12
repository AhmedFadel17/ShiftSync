namespace ShiftSync.API.Models.Entities;

public class BreakType
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int MaxDurationMinutes { get; set; }
    public int MaxOccurrencesPerShift { get; set; } = 1;
    public bool IsActive { get; set; } = true;

    public ICollection<AttendanceBreak> AttendanceBreaks { get; set; } = new List<AttendanceBreak>();
}
