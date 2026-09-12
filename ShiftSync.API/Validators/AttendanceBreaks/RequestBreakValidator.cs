using FluentValidation;
using ShiftSync.API.DTOs.AttendanceBreaks;

namespace ShiftSync.API.Validators.AttendanceBreaks;

public class RequestBreakValidator : AbstractValidator<RequestBreakDto>
{
    public RequestBreakValidator()
    {
        RuleFor(x => x.AttendanceId)
            .GreaterThan(0).WithMessage("A valid Attendance ID is required.");

        RuleFor(x => x.BreakTypeId)
            .GreaterThan(0).WithMessage("A valid Break Type ID is required.");

        RuleFor(x => x.Note)
            .MaximumLength(500).WithMessage("Note must not exceed 500 characters.")
            .When(x => x.Note != null);
    }
}
