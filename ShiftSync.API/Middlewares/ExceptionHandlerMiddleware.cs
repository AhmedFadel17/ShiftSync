namespace ShiftSync.API.Middlewares;


using FluentValidation;
using ShiftSync.API.Factories;

public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;

    public ExceptionHandlerMiddleware(RequestDelegate next, ILogger<ExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = exception switch
        {
            KeyNotFoundException => StatusCodes.Status404NotFound,
            ValidationException => StatusCodes.Status422UnprocessableEntity,
            ArgumentException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError,
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "An unhandled system exception occurred on request {Path}", context.Request.Path);
        }
        else
        {
            _logger.LogWarning("Request validation/business rule failed on {Path}. Status: {StatusCode}. Reason: {Message}",
                context.Request.Path, statusCode, exception.Message);
        }

        Dictionary<string, List<string>> errors = new();

        if (exception is ValidationException validationEx)
        {
            foreach (var failure in validationEx.Errors)
            {
                if (!errors.ContainsKey(failure.PropertyName))
                    errors[failure.PropertyName] = new List<string>();

                errors[failure.PropertyName].Add(failure.ErrorMessage);
            }
        }

        var response = ApiResponseFactory.Error(
            exception is ValidationException ? "Validation failed" : exception.Message,
            errors.Any() ? errors : null,
            statusCode
        );

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(response);
    }
}
