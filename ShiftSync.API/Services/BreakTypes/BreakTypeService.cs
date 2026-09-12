using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShiftSync.API.DTOs.BreakTypes;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Repositories.BreakTypes;

namespace ShiftSync.API.Services.BreakTypes;

public class BreakTypeService : IBreakTypeService
{
    private readonly IBreakTypeRepository _breakTypeRepository;
    private readonly IMapper _mapper;

    public BreakTypeService(IBreakTypeRepository breakTypeRepository, IMapper mapper)
    {
        _breakTypeRepository = breakTypeRepository;
        _mapper = mapper;
    }

    public async Task<PaginationSource<BreakTypeResponseDto>> GetPagedAsync(BreakTypeFilterDto filter, CancellationToken cancellationToken = default)
    {
        var source = await _breakTypeRepository.GetPagedAsync(filter, cancellationToken);
        var mapped = _mapper.Map<List<BreakTypeResponseDto>>(source.Items);
        return new PaginationSource<BreakTypeResponseDto>(mapped, source.PageNumber, source.PageSize, source.TotalCount);
    }

    public async Task<BreakTypeResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var breakType = await _breakTypeRepository.Query()
            .FirstOrDefaultAsync(bt => bt.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Break type with id {id} was not found.");

        return _mapper.Map<BreakTypeResponseDto>(breakType);
    }

    public async Task<BreakTypeResponseDto> CreateAsync(CreateBreakTypeDto dto, CancellationToken cancellationToken = default)
    {
        if (await _breakTypeRepository.ExistsByNameAsync(dto.Name, cancellationToken: cancellationToken))
            throw new ArgumentException($"A break type named '{dto.Name}' already exists.");

        var breakType = _mapper.Map<BreakType>(dto);
        await _breakTypeRepository.AddAsync(breakType, cancellationToken);
        await _breakTypeRepository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<BreakTypeResponseDto>(breakType);
    }

    public async Task<BreakTypeResponseDto> UpdateAsync(int id, UpdateBreakTypeDto dto, CancellationToken cancellationToken = default)
    {
        var breakType = await _breakTypeRepository.Query()
            .FirstOrDefaultAsync(bt => bt.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Break type with id {id} was not found.");

        if (dto.Name != null && await _breakTypeRepository.ExistsByNameAsync(dto.Name, excludeId: id, cancellationToken: cancellationToken))
            throw new ArgumentException($"A break type named '{dto.Name}' already exists.");

        _mapper.Map(dto, breakType);
        _breakTypeRepository.Update(breakType);
        await _breakTypeRepository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<BreakTypeResponseDto>(breakType);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var breakType = await _breakTypeRepository.Query()
            .FirstOrDefaultAsync(bt => bt.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Break type with id {id} was not found.");

        if (await _breakTypeRepository.HasAttendanceBreaksAsync(id, cancellationToken))
            throw new InvalidOperationException("Cannot deactivate a break type that has existing attendance break records.");

        breakType.IsActive = false;
        _breakTypeRepository.Update(breakType);
        await _breakTypeRepository.SaveChangesAsync(cancellationToken);
    }
}
