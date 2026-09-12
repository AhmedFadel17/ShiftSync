namespace ShiftSync.API.Models.Entities;

public class Shift
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }

    public int MaxAllowedBreaksDurationMinutes { get; set; } = 60;

    public int MinActiveEmployeesRequired { get; set; } = 2;

    public bool IsActive { get; set; } = true;

    public ICollection<UserShift> UserShifts { get; set; } = new List<UserShift>();
}
