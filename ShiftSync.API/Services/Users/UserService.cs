using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.Users;
using ShiftSync.API.DTOs.UserShifts;
using ShiftSync.API.Models;
using ShiftSync.API.Repositories.Users;

namespace ShiftSync.API.Services.Users;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;

    }

    public async Task<PaginationSource<UserResponseDto>> GetPagedAsync(UserFilterDto filter, CancellationToken cancellationToken = default)
    {
        var source = await _userRepository.GetPagedAsync(filter, cancellationToken);
        var mapped = _mapper.Map<List<UserResponseDto>>(source.Items);
        return new PaginationSource<UserResponseDto>(mapped, source.PageNumber, source.PageSize, source.TotalCount);
    }

    public async Task<UserResponseDto> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.Query()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"User with id {id} was not found.");

        return _mapper.Map<UserResponseDto>(user);
    }


    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.Query()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"User with id {id} was not found.");

        user.IsActive = false;
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task RestoreAsync(string id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.Query()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"User with id {id} was not found.");

        user.IsActive = true;
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(cancellationToken);
    }
}
