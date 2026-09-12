namespace ShiftSync.API.Models.Entities;

public class UserShift
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    public int ShiftId { get; set; }
    public Shift Shift { get; set; } = null!;

    public DateTime Date { get; set; }


    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
