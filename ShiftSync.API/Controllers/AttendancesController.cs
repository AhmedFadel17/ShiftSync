using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShiftSync.API.DTOs.Attendances;
using ShiftSync.API.Factories;
using ShiftSync.API.Services.Attendances;

namespace ShiftSync.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class AttendancesController : ApiBaseController
{
    private readonly IAttendanceService _attendanceService;

    public AttendancesController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    /// <summary>Returns a paginated list of attendance records.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] AttendanceFilterDto filter, CancellationToken cancellationToken)
    {
        var source = await _attendanceService.GetPagedAsync(filter, cancellationToken);
        return Ok(ApiResponseFactory.Success(source));
    }

    /// <summary>Returns a single attendance record by ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var attendance = await _attendanceService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(attendance));
    }

    /// <summary>Records a check-in for the current user.</summary>
    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInDto dto, CancellationToken cancellationToken)
    {
        var attendance = await _attendanceService.CheckInAsync(CurrentUserId!, dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = attendance.Id }, ApiResponseFactory.Success(attendance, statusCode: 201));
    }

    /// <summary>Records a check-out for the current user.</summary>
    [HttpPut("{id:int}/check-out")]
    public async Task<IActionResult> CheckOut(int id, [FromBody] CheckOutDto dto, CancellationToken cancellationToken)
    {
        var attendance = await _attendanceService.CheckOutAsync(CurrentUserId!, id, dto, cancellationToken);
        return Ok(ApiResponseFactory.Success(attendance));
    }
}
