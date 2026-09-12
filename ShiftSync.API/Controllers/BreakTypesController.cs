using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShiftSync.API.DTOs.BreakTypes;
using ShiftSync.API.Factories;
using ShiftSync.API.Services.BreakTypes;

namespace ShiftSync.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class BreakTypesController : ApiBaseController
{
    private readonly IBreakTypeService _breakTypeService;

    public BreakTypesController(IBreakTypeService breakTypeService)
    {
        _breakTypeService = breakTypeService;
    }

    /// <summary>Returns a paginated list of break types.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] BreakTypeFilterDto filter, CancellationToken cancellationToken)
    {
        var source = await _breakTypeService.GetPagedAsync(filter, cancellationToken);
        return Ok(ApiResponseFactory.Success(source));
    }

    /// <summary>Returns a single break type by ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var breakType = await _breakTypeService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(breakType));
    }

    /// <summary>Creates a new break type. Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBreakTypeDto dto, CancellationToken cancellationToken)
    {
        var breakType = await _breakTypeService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = breakType.Id }, ApiResponseFactory.Success(breakType, statusCode: 201));
    }

    /// <summary>Updates a break type. Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBreakTypeDto dto, CancellationToken cancellationToken)
    {
        var breakType = await _breakTypeService.UpdateAsync(id, dto, cancellationToken);
        return Ok(ApiResponseFactory.Success(breakType));
    }

    /// <summary>Soft-deletes a break type. Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _breakTypeService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success<object?>(null, "Break type deactivated successfully."));
    }
}
