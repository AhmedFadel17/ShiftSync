
namespace ShiftSync.API.DTOs.Common
{
    public record SuccessResponseDto<T> : ApiResponseDto
    {
        public T? Data { get; init; }
    }
}
