namespace ShiftSync.API.DTOs.Common;

public class PaginationSource<T>
{
    public List<T> Items { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }
    public int ItemsCount { get; set; }
    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }

    public PaginationSource(List<T> items, int pageNumber, int pageSize, int totalCount)
    {
        Items = items;
        ItemsCount = items.Count;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalCount = totalCount;
        TotalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        HasPreviousPage = pageNumber > 1;
        HasNextPage = PageNumber < TotalPages;
    }
}