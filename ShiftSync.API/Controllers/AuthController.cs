using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShiftSync.API.DTOs.Auth;
using ShiftSync.API.Factories;
using ShiftSync.API.Services.Auth;

namespace ShiftSync.API.Controllers;

[AllowAnonymous]
[Route("api/[controller]")]
public class AuthController : ApiBaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>Authenticates a user and returns a JWT token.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(dto, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "Login successful."));
    }

    /// <summary>Registers a new user account.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(dto, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "Registration successful.", 201));
    }
}
