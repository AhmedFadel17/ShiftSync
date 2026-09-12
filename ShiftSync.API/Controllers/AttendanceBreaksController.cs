using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShiftSync.API.DTOs.AttendanceBreaks;
using ShiftSync.API.Factories;
using ShiftSync.API.Services.AttendanceBreaks;

namespace ShiftSync.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class AttendanceBreaksController : ApiBaseController
{
    private readonly IAttendanceBreakService _breakService;

    public AttendanceBreaksController(IAttendanceBreakService breakService)
    {
        _breakService = breakService;
    }

    /// <summary>Returns a paginated list of attendance breaks.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] AttendanceBreakFilterDto filter, CancellationToken cancellationToken)
    {
        var source = await _breakService.GetPagedAsync(filter, cancellationToken);
        return Ok(ApiResponseFactory.Success(source));
    }

    /// <summary>Returns a single attendance break by ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var breakRecord = await _breakService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(breakRecord));
    }

    /// <summary>Submits a break request for the current user.</summary>
    [HttpPost("request")]
    public async Task<IActionResult> RequestBreak([FromBody] RequestBreakDto dto, CancellationToken cancellationToken)
    {
        var breakRecord = await _breakService.RequestBreakAsync(CurrentUserId!, dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = breakRecord.Id }, ApiResponseFactory.Success(breakRecord, statusCode: 201));
    }

    /// <summary>Updates the status of a break (Approve / Reject / Complete). Admin only.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateBreakStatusDto dto, CancellationToken cancellationToken)
    {
        var breakRecord = await _breakService.UpdateStatusAsync(id, dto, cancellationToken);
        return Ok(ApiResponseFactory.Success(breakRecord));
    }
}
