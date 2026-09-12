using ShiftSync.API.DTOs.Attendances;
using ShiftSync.API.DTOs.Common;

namespace ShiftSync.API.Services.Attendances;

public interface IAttendanceService
{
    Task<PaginationSource<AttendanceResponseDto>> GetPagedAsync(AttendanceFilterDto filter, CancellationToken cancellationToken = default);
    Task<AttendanceResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<AttendanceResponseDto> CheckInAsync(string userId, CheckInDto dto, CancellationToken cancellationToken = default);
    Task<AttendanceResponseDto> CheckOutAsync(string userId, int attendanceId, CheckOutDto dto, CancellationToken cancellationToken = default);
}
