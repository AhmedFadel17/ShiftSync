using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.UserShifts;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Repositories.Shifts;
using ShiftSync.API.Repositories.UserShifts;

namespace ShiftSync.API.Services.UserShifts;

public class UserShiftService : IUserShiftService
{
    private readonly IUserShiftRepository _userShiftRepository;
    private readonly IShiftRepository _shiftRepository;
    private readonly IMapper _mapper;

    public UserShiftService(
        IUserShiftRepository userShiftRepository,
        IShiftRepository shiftRepository,
        IMapper mapper)
    {
        _userShiftRepository = userShiftRepository;
        _shiftRepository = shiftRepository;
        _mapper = mapper;
    }

    public async Task<PaginationSource<UserShiftResponseDto>> GetPagedAsync(UserShiftFilterDto filter, CancellationToken cancellationToken = default)
    {
        var source = await _userShiftRepository.GetPagedAsync(filter, cancellationToken);
        var mapped = _mapper.Map<List<UserShiftResponseDto>>(source.Items);
        return new PaginationSource<UserShiftResponseDto>(mapped, source.PageNumber, source.PageSize, source.TotalCount);
    }

    public async Task<UserShiftResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var userShift = await _userShiftRepository.Query()
            .Include(us => us.User)
            .Include(us => us.Shift)
            .FirstOrDefaultAsync(us => us.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"UserShift with id {id} was not found.");

        return _mapper.Map<UserShiftResponseDto>(userShift);
    }

    public async Task<UserShiftResponseDto> AssignAsync(AssignUserShiftDto dto, CancellationToken cancellationToken = default)
    {
        // Verify shift is active
        var shift = await _shiftRepository.Query()
            .FirstOrDefaultAsync(s => s.Id == dto.ShiftId, cancellationToken)
            ?? throw new KeyNotFoundException($"Shift with id {dto.ShiftId} was not found.");

        if (!shift.IsActive)
            throw new ArgumentException("Cannot assign a user to an inactive shift.");

        // Verify duplicate assignment
        var existing = await _userShiftRepository.FindByUserShiftDateAsync(dto.UserId, dto.ShiftId, dto.Date, cancellationToken);
        if (existing != null)
            throw new ArgumentException("This user is already assigned to this shift on the selected date.");

        var userShift = _mapper.Map<UserShift>(dto);
        await _userShiftRepository.AddAsync(userShift, cancellationToken);
        await _userShiftRepository.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(userShift.Id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var userShift = await _userShiftRepository.Query()
            .FirstOrDefaultAsync(us => us.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"UserShift with id {id} was not found.");

        if (await _userShiftRepository.HasAttendanceRecordsAsync(id, cancellationToken))
            throw new InvalidOperationException("Cannot delete a user shift that has attendance records.");

        _userShiftRepository.Remove(userShift);
        await _userShiftRepository.SaveChangesAsync(cancellationToken);
    }
}
