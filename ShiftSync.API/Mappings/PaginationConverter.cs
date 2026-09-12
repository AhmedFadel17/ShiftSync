using AutoMapper;
using ShiftSync.API.DTOs.Common;

namespace ShiftSync.API.Mappings;

public class PaginationConverter<TSource, TDestination>
    : ITypeConverter<PaginationSource<TSource>, PaginationResponseDto<TDestination>>
{
    private readonly IMapper _mapper;

    public PaginationConverter(IMapper mapper)
    {
        _mapper = mapper;
    }

    public PaginationResponseDto<TDestination> Convert(
        PaginationSource<TSource> source,
        PaginationResponseDto<TDestination> destination,
        ResolutionContext context)
    {
        return new PaginationResponseDto<TDestination>
        {
            Items = _mapper.Map<List<TDestination>>(source.Items),
            PageNumber = source.PageNumber,
            PageSize = source.PageSize,
            TotalCount = source.TotalCount,
            HasPreviousPage = source.HasPreviousPage,
            HasNextPage = source.HasNextPage,
            TotalPages = source.TotalPages,
            ItemsCount = source.ItemsCount
        };
    }
}
