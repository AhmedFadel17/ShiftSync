namespace ShiftSync.API.DTOs.Attendances;

public record CheckOutDto
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }
}
