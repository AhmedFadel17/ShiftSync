using ShiftSync.API.DTOs.Common;

namespace ShiftSync.API.DTOs.Shifts;

public record ShiftFilterDto : BaseFilterDto
{
    public bool? IsActive { get; init; }
}
