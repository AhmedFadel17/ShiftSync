using ShiftSync.API.DTOs.Common;

namespace ShiftSync.API.Factories;

public static class ApiResponseFactory
{
    public static SuccessResponseDto<T> Success<T>(T data, string? message = null, int statusCode = 200)
        => new SuccessResponseDto<T>
        {
            Data = data,
            Message = message ?? "",
            StatusCode = statusCode
        };

    public static ErrorResponseDto Error(string message, Dictionary<string, List<string>>? errors = null, int statusCode = 400)
        => new ErrorResponseDto
        {
            Errors = errors,
            Message = message,
            StatusCode = statusCode
        };
}