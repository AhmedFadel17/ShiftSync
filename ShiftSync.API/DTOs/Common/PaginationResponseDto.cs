namespace ShiftSync.API.DTOs.Common;

public record PaginationResponseDto<T>
{
    public List<T> Items { get; set; } = new List<T>();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }
    public int ItemsCount { get; set; }
    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }
}