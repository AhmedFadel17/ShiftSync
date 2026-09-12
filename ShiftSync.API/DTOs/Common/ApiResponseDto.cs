
namespace ShiftSync.API.DTOs.Common
{
    public record ApiResponseDto
    {
        public int StatusCode { get; init; }
        public string Message { get; init; } = string.Empty;
    }
}
