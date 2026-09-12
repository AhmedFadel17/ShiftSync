using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShiftSync.API.DTOs.UserShifts;
using ShiftSync.API.Factories;
using ShiftSync.API.Services.UserShifts;

namespace ShiftSync.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class UserShiftsController : ApiBaseController
{
    private readonly IUserShiftService _userShiftService;

    public UserShiftsController(IUserShiftService userShiftService)
    {
        _userShiftService = userShiftService;
    }

    /// <summary>Returns a paginated list of user shift assignments.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] UserShiftFilterDto filter, CancellationToken cancellationToken)
    {
        var source = await _userShiftService.GetPagedAsync(filter, cancellationToken);
        return Ok(ApiResponseFactory.Success(source));
    }

    /// <summary>Returns a single user shift assignment by ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var userShift = await _userShiftService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(userShift));
    }

    /// <summary>Assigns a user to a shift on a specific date. Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Assign([FromBody] AssignUserShiftDto dto, CancellationToken cancellationToken)
    {
        var userShift = await _userShiftService.AssignAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = userShift.Id }, ApiResponseFactory.Success(userShift, statusCode: 201));
    }

    /// <summary>Deletes a user shift assignment (only if no attendance exists). Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _userShiftService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success<object?>(null, "User shift assignment removed successfully."));
    }
}
