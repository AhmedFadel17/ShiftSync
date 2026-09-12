namespace ShiftSync.API.DTOs.Common;

public record BaseResponseDto
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public bool IsDeleted { get; set; }
}
