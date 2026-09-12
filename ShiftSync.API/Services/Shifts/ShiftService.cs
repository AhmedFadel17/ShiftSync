using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.Shifts;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Repositories.Shifts;

namespace ShiftSync.API.Services.Shifts;

public class ShiftService : IShiftService
{
    private readonly IShiftRepository _shiftRepository;
    private readonly IMapper _mapper;

    public ShiftService(IShiftRepository shiftRepository, IMapper mapper)
    {
        _shiftRepository = shiftRepository;
        _mapper = mapper;
    }

    public async Task<PaginationSource<ShiftResponseDto>> GetPagedAsync(ShiftFilterDto filter, CancellationToken cancellationToken = default)
    {
        var source = await _shiftRepository.GetPagedAsync(filter, cancellationToken);
        var mapped = _mapper.Map<List<ShiftResponseDto>>(source.Items);
        return new PaginationSource<ShiftResponseDto>(mapped, source.PageNumber, source.PageSize, source.TotalCount);
    }

    public async Task<ShiftResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var shift = await _shiftRepository.Query()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Shift with id {id} was not found.");

        return _mapper.Map<ShiftResponseDto>(shift);
    }

    public async Task<ShiftResponseDto> CreateAsync(CreateShiftDto dto, CancellationToken cancellationToken = default)
    {
        if (await _shiftRepository.ExistsByNameAsync(dto.Name, cancellationToken: cancellationToken))
            throw new ArgumentException($"A shift named '{dto.Name}' already exists.");

        var shift = _mapper.Map<Shift>(dto);
        await _shiftRepository.AddAsync(shift, cancellationToken);
        await _shiftRepository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ShiftResponseDto>(shift);
    }

    public async Task<ShiftResponseDto> UpdateAsync(int id, UpdateShiftDto dto, CancellationToken cancellationToken = default)
    {
        var shift = await _shiftRepository.Query()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Shift with id {id} was not found.");

        if (dto.Name != null && await _shiftRepository.ExistsByNameAsync(dto.Name, excludeId: id, cancellationToken: cancellationToken))
            throw new ArgumentException($"A shift named '{dto.Name}' already exists.");

        _mapper.Map(dto, shift);
        _shiftRepository.Update(shift);
        await _shiftRepository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ShiftResponseDto>(shift);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var shift = await _shiftRepository.Query()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Shift with id {id} was not found.");

        if (await _shiftRepository.HasActiveFutureAssignmentsAsync(id, cancellationToken))
            throw new InvalidOperationException("Cannot deactivate a shift with active future user assignments.");

        shift.IsActive = false;
        _shiftRepository.Update(shift);
        await _shiftRepository.SaveChangesAsync(cancellationToken);
    }
}
