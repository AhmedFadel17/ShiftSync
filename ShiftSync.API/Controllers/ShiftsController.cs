using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.Shifts;
using ShiftSync.API.Factories;
using ShiftSync.API.Services.Shifts;

namespace ShiftSync.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class ShiftsController : ApiBaseController
{
    private readonly IShiftService _shiftService;

    public ShiftsController(IShiftService shiftService)
    {
        _shiftService = shiftService;
    }

    /// <summary>Returns a paginated list of shifts.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ShiftFilterDto filter, CancellationToken cancellationToken)
    {
        var source = await _shiftService.GetPagedAsync(filter, cancellationToken);
        return Ok(ApiResponseFactory.Success(source));
    }

    /// <summary>Returns a single shift by ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var shift = await _shiftService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(shift));
    }

    /// <summary>Creates a new shift. Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateShiftDto dto, CancellationToken cancellationToken)
    {
        var shift = await _shiftService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = shift.Id }, ApiResponseFactory.Success(shift, statusCode: 201));
    }

    /// <summary>Updates an existing shift. Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateShiftDto dto, CancellationToken cancellationToken)
    {
        var shift = await _shiftService.UpdateAsync(id, dto, cancellationToken);
        return Ok(ApiResponseFactory.Success(shift));
    }

    /// <summary>Soft-deletes a shift (sets IsActive = false). Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _shiftService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success<object?>(null, "Shift deactivated successfully."));
    }
}
