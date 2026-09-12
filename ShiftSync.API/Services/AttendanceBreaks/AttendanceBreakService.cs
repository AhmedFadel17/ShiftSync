using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShiftSync.API.DTOs.AttendanceBreaks;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Models.Enums;
using ShiftSync.API.Repositories.AttendanceBreaks;
using ShiftSync.API.Repositories.Attendances;

namespace ShiftSync.API.Services.AttendanceBreaks;

public class AttendanceBreakService : IAttendanceBreakService
{
    private readonly IAttendanceBreakRepository _breakRepository;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IMapper _mapper;

    public AttendanceBreakService(
        IAttendanceBreakRepository breakRepository,
        IAttendanceRepository attendanceRepository,
        IMapper mapper)
    {
        _breakRepository = breakRepository;
        _attendanceRepository = attendanceRepository;
        _mapper = mapper;
    }

    public async Task<PaginationSource<AttendanceBreakResponseDto>> GetPagedAsync(AttendanceBreakFilterDto filter, CancellationToken cancellationToken = default)
    {
        var source = await _breakRepository.GetPagedAsync(filter, cancellationToken);
        var mapped = _mapper.Map<List<AttendanceBreakResponseDto>>(source.Items);
        return new PaginationSource<AttendanceBreakResponseDto>(mapped, source.PageNumber, source.PageSize, source.TotalCount);
    }

    public async Task<AttendanceBreakResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var breakRecord = await _breakRepository.Query()
            .Include(ab => ab.BreakType)
            .FirstOrDefaultAsync(ab => ab.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Attendance break with id {id} was not found.");

        return _mapper.Map<AttendanceBreakResponseDto>(breakRecord);
    }

    public async Task<AttendanceBreakResponseDto> RequestBreakAsync(string userId, RequestBreakDto dto, CancellationToken cancellationToken = default)
    {
        // Load attendance with its shift and break type info
        var attendance = await _attendanceRepository.Query()
            .Include(a => a.UserShift).ThenInclude(us => us.Shift)
            .Include(a => a.Breaks).ThenInclude(b => b.BreakType)
            .FirstOrDefaultAsync(a => a.Id == dto.AttendanceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Attendance record with id {dto.AttendanceId} was not found.");

        if (attendance.UserId != userId)
            throw new UnauthorizedAccessException("You can only request breaks for your own attendance.");

        if (attendance.CheckOutTime.HasValue)
            throw new ArgumentException("Cannot request a break after checking out.");

        // Load the break type
        var breakType = attendance.Breaks
            .Select(b => b.BreakType)
            .FirstOrDefault(bt => bt.Id == dto.BreakTypeId)
            ?? await _breakRepository.Query()
                .Include(ab => ab.BreakType)
                .Where(ab => ab.BreakTypeId == dto.BreakTypeId)
                .Select(ab => ab.BreakType)
                .FirstOrDefaultAsync(cancellationToken)
            ?? throw new KeyNotFoundException($"Break type with id {dto.BreakTypeId} was not found.");

        // Enforce MaxOccurrencesPerShift
        var occurrenceCount = await _breakRepository.CountByTypeAsync(dto.AttendanceId, dto.BreakTypeId, cancellationToken);
        if (occurrenceCount >= breakType.MaxOccurrencesPerShift)
            throw new ArgumentException($"You have reached the maximum number of '{breakType.Name}' breaks ({breakType.MaxOccurrencesPerShift}) for this shift.");

        // Enforce total break budget
        var totalUsedMinutes = await _breakRepository.GetTotalBreakMinutesAsync(dto.AttendanceId, cancellationToken);
        if (totalUsedMinutes >= attendance.UserShift.Shift.MaxAllowedBreaksDurationMinutes)
            throw new ArgumentException($"Total break time budget of {attendance.UserShift.Shift.MaxAllowedBreaksDurationMinutes} minutes has been exhausted.");

        // Enforce MinActiveEmployeesRequired — check how many are currently on break
        var activeBreaks = await _breakRepository.CountActiveBreaksForShiftAsync(attendance.UserShiftId, cancellationToken);
        var shift = attendance.UserShift.Shift;
        // Count all employees on this shift today to determine active headcount
        // (active = not on break): If approving would push too many onto break, queue it
        var initialStatus = activeBreaks >= (shift.MinActiveEmployeesRequired - 1)
            ? BreakStatus.WaitingQueue
            : BreakStatus.Approved;

        var breakRecord = new AttendanceBreak
        {
            AttendanceId = dto.AttendanceId,
            BreakTypeId = dto.BreakTypeId,
            Note = dto.Note,
            RequestTime = DateTime.UtcNow,
            Status = initialStatus,
            StartTime = initialStatus == BreakStatus.Approved ? DateTime.UtcNow : null
        };

        await _breakRepository.AddAsync(breakRecord, cancellationToken);
        await _breakRepository.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(breakRecord.Id, cancellationToken);
    }

    public async Task<AttendanceBreakResponseDto> UpdateStatusAsync(int id, UpdateBreakStatusDto dto, CancellationToken cancellationToken = default)
    {
        var breakRecord = await _breakRepository.Query()
            .Include(ab => ab.BreakType)
            .FirstOrDefaultAsync(ab => ab.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Attendance break with id {id} was not found.");

        // Validate status transition
        var validTransition = (breakRecord.Status, dto.Status) switch
        {
            (BreakStatus.WaitingQueue, BreakStatus.Approved) => true,
            (BreakStatus.WaitingQueue, BreakStatus.Rejected) => true,
            (BreakStatus.Approved, BreakStatus.Completed) => true,
            _ => false
        };

        if (!validTransition)
            throw new ArgumentException($"Cannot transition from '{breakRecord.Status}' to '{dto.Status}'.");

        breakRecord.Status = dto.Status;
        if (dto.Note != null) breakRecord.Note = dto.Note;

        if (dto.Status == BreakStatus.Approved)
            breakRecord.StartTime = DateTime.UtcNow;

        if (dto.Status == BreakStatus.Completed)
            breakRecord.EndTime = DateTime.UtcNow;

        _breakRepository.Update(breakRecord);
        await _breakRepository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<AttendanceBreakResponseDto>(breakRecord);
    }

    public async Task<AttendanceBreakResponseDto> EndBreakAsync(string userId, int id, CancellationToken cancellationToken = default)
    {
        var breakRecord = await _breakRepository.Query()
            .Include(ab => ab.BreakType)
            .Include(ab => ab.Attendance)
            .FirstOrDefaultAsync(ab => ab.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Attendance break with id {id} was not found.");

        if (breakRecord.Attendance?.UserId != userId)
            throw new UnauthorizedAccessException("You can only end breaks for your own attendance.");

        if (breakRecord.Status != BreakStatus.Approved && breakRecord.Status != BreakStatus.WaitingQueue)
            throw new ArgumentException("Only active or queued breaks can be ended.");

        breakRecord.Status = BreakStatus.Completed;
        breakRecord.EndTime = DateTime.UtcNow;

        _breakRepository.Update(breakRecord);
        await _breakRepository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<AttendanceBreakResponseDto>(breakRecord);
    }
}

