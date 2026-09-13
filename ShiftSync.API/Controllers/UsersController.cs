using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShiftSync.API.DTOs.Users;
using ShiftSync.API.DTOs.UserShifts;
using ShiftSync.API.Factories;
using ShiftSync.API.Services.Users;
using ShiftSync.API.Services.UserShifts;

namespace ShiftSync.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class UsersController : ApiBaseController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>Returns a paginated list of user shift assignments.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] UserFilterDto filter, CancellationToken cancellationToken)
    {
        var source = await _userService.GetPagedAsync(filter, cancellationToken);
        return Ok(ApiResponseFactory.Success(source));
    }

    /// <summary>Returns a single user shift assignment by ID.</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(user));
    }

    /// <summary>Restores a deleted user shift assignment. Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/restore")]
    public async Task<IActionResult> Restore(string id, CancellationToken cancellationToken)
    {
        await _userService.RestoreAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success<object?>(null, "User restored successfully."));
    }

    /// <summary>Deletes a user shift assignment (only if no attendance exists). Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        await _userService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success<object?>(null, "User deleted successfully."));
    }
}
