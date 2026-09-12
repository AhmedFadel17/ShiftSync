namespace ShiftSync.API.DTOs.Attendances;

public record CheckInDto
{
    public int UserShiftId { get; init; }
    public double Latitude { get; init; }
    public double Longitude { get; init; }
}
