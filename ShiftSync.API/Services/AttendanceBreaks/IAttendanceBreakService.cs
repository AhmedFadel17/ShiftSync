using ShiftSync.API.DTOs.AttendanceBreaks;
using ShiftSync.API.DTOs.Common;

namespace ShiftSync.API.Services.AttendanceBreaks;

public interface IAttendanceBreakService
{
    Task<PaginationSource<AttendanceBreakResponseDto>> GetPagedAsync(AttendanceBreakFilterDto filter, CancellationToken cancellationToken = default);
    Task<AttendanceBreakResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<AttendanceBreakResponseDto> RequestBreakAsync(string userId, RequestBreakDto dto, CancellationToken cancellationToken = default);
    Task<AttendanceBreakResponseDto> UpdateStatusAsync(int id, UpdateBreakStatusDto dto, CancellationToken cancellationToken = default);
    Task<AttendanceBreakResponseDto> EndBreakAsync(string userId, int id, CancellationToken cancellationToken = default);
}

