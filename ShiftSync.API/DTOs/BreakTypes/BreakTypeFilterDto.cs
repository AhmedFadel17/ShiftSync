using ShiftSync.API.DTOs.Common;

namespace ShiftSync.API.DTOs.BreakTypes;

public record BreakTypeFilterDto : BaseFilterDto
{
    public bool? IsActive { get; init; }
}
