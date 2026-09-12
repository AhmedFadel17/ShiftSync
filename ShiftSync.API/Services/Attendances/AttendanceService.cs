using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShiftSync.API.DTOs.Attendances;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Repositories.Attendances;
using ShiftSync.API.Repositories.UserShifts;

namespace ShiftSync.API.Services.Attendances;

public class AttendanceService : IAttendanceService
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IUserShiftRepository _userShiftRepository;
    private readonly IMapper _mapper;

    private static readonly TimeSpan GraceWindow = TimeSpan.FromMinutes(15);

    public AttendanceService(
        IAttendanceRepository attendanceRepository,
        IUserShiftRepository userShiftRepository,
        IMapper mapper)
    {
        _attendanceRepository = attendanceRepository;
        _userShiftRepository = userShiftRepository;
        _mapper = mapper;
    }

    public async Task<PaginationSource<AttendanceResponseDto>> GetPagedAsync(AttendanceFilterDto filter, CancellationToken cancellationToken = default)
    {
        var source = await _attendanceRepository.GetPagedAsync(filter, cancellationToken);
        var mapped = _mapper.Map<List<AttendanceResponseDto>>(source.Items);
        return new PaginationSource<AttendanceResponseDto>(mapped, source.PageNumber, source.PageSize, source.TotalCount);
    }

    public async Task<AttendanceResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var attendance = await _attendanceRepository.Query()
            .Include(a => a.User)
            .Include(a => a.UserShift).ThenInclude(us => us.Shift)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Attendance record with id {id} was not found.");

        return _mapper.Map<AttendanceResponseDto>(attendance);
    }

    public async Task<AttendanceResponseDto> CheckInAsync(string userId, CheckInDto dto, CancellationToken cancellationToken = default)
    {
        var userShift = await _userShiftRepository.Query()
            .Include(us => us.Shift)
            .FirstOrDefaultAsync(us => us.Id == dto.UserShiftId, cancellationToken)
            ?? throw new KeyNotFoundException($"UserShift with id {dto.UserShiftId} was not found.");

        // Ensure shift belongs to the requesting user
        if (userShift.UserId != userId)
            throw new UnauthorizedAccessException("You can only check in to your own assigned shifts.");

        // Grace window check: allow ±15 min from shift StartTime on the assigned Date
        var shiftStartUtc = userShift.Date.Date + userShift.Shift.StartTime;
        var now = DateTime.UtcNow;
        if (now < shiftStartUtc - GraceWindow || now > shiftStartUtc + GraceWindow)
            throw new ArgumentException($"Check-in is only allowed within 15 minutes of the shift start time ({userShift.Shift.StartTime:hh\\:mm}).");

        // Prevent double check-in
        var existingOpen = await _attendanceRepository.GetOpenAttendanceAsync(userId, dto.UserShiftId, cancellationToken);
        if (existingOpen != null)
            throw new ArgumentException("You already have an open check-in for this shift. Please check out first.");

        var attendance = new Attendance
        {
            UserId = userId,
            UserShiftId = dto.UserShiftId,
            CheckInTime = now,
            CheckInLatitude = dto.Latitude,
            CheckInLongitude = dto.Longitude
        };

        await _attendanceRepository.AddAsync(attendance, cancellationToken);
        await _attendanceRepository.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(attendance.Id, cancellationToken);
    }

    public async Task<AttendanceResponseDto> CheckOutAsync(string userId, int attendanceId, CheckOutDto dto, CancellationToken cancellationToken = default)
    {
        var attendance = await _attendanceRepository.Query()
            .FirstOrDefaultAsync(a => a.Id == attendanceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Attendance record with id {attendanceId} was not found.");

        if (attendance.UserId != userId)
            throw new UnauthorizedAccessException("You can only check out of your own attendance record.");

        if (attendance.CheckOutTime.HasValue)
            throw new ArgumentException("This attendance record is already checked out.");

        attendance.CheckOutTime = DateTime.UtcNow;
        attendance.CheckOutLatitude = dto.Latitude;
        attendance.CheckOutLongitude = dto.Longitude;

        _attendanceRepository.Update(attendance);
        await _attendanceRepository.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(attendanceId, cancellationToken);
    }
}
