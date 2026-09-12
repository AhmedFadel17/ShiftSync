using AutoMapper;
using ShiftSync.API.DTOs.AttendanceBreaks;
using ShiftSync.API.DTOs.Attendances;
using ShiftSync.API.DTOs.BreakTypes;
using ShiftSync.API.DTOs.Common;
using ShiftSync.API.DTOs.Shifts;
using ShiftSync.API.DTOs.Users;
using ShiftSync.API.DTOs.UserShifts;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Pagination (generic converter) ──────────────────────────────
        CreateMap(typeof(PaginationSource<>), typeof(PaginationResponseDto<>))
            .ConvertUsing(typeof(PaginationConverter<,>));

        // ── Shifts ──────────────────────────────────────────────────────
        CreateMap<CreateShiftDto, Shift>();

        CreateMap<UpdateShiftDto, Shift>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<Shift, ShiftResponseDto>()
            .ForMember(dest => dest.DurationHours,
                opt => opt.MapFrom(src => (src.EndTime - src.StartTime).TotalHours));

        // ── BreakTypes ──────────────────────────────────────────────────
        CreateMap<CreateBreakTypeDto, BreakType>();

        CreateMap<UpdateBreakTypeDto, BreakType>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<BreakType, BreakTypeResponseDto>();

        // ── UserShifts ──────────────────────────────────────────────────
        CreateMap<AssignUserShiftDto, UserShift>();

        CreateMap<UserShift, UserShiftResponseDto>()
            .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.ShiftName, opt => opt.MapFrom(src => src.Shift.Name))
            .ForMember(dest => dest.ShiftStartTime, opt => opt.MapFrom(src => src.Shift.StartTime))
            .ForMember(dest => dest.ShiftEndTime, opt => opt.MapFrom(src => src.Shift.EndTime));

        // ── Attendance ──────────────────────────────────────────────────
        CreateMap<Attendance, AttendanceResponseDto>()
            .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.ShiftName, opt => opt.MapFrom(src => src.UserShift.Shift.Name))
            .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.UserShift.Date));

        // ── AttendanceBreaks ────────────────────────────────────────────
        CreateMap<AttendanceBreak, AttendanceBreakResponseDto>()
            .ForMember(dest => dest.BreakTypeName, opt => opt.MapFrom(src => src.BreakType.Name));

        CreateMap<ApplicationUser, UserResponseDto>();

    }
}