namespace ShiftSync.API.DTOs.Common;

public record BaseFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public string? OrderBy { get; set; }
    public string? SortOrder { get; set; }
    public int? Limit { get; set; }
}
