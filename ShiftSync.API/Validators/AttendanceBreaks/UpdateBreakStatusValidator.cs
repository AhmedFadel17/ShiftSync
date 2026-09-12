using FluentValidation;
using ShiftSync.API.DTOs.AttendanceBreaks;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.Validators.AttendanceBreaks;

public class UpdateBreakStatusValidator : AbstractValidator<UpdateBreakStatusDto>
{
    private static readonly BreakStatus[] ValidStatuses =
    [
        BreakStatus.Approved,
        BreakStatus.Rejected,
        BreakStatus.Completed
    ];

    public UpdateBreakStatusValidator()
    {
        RuleFor(x => x.Status)
            .Must(s => ValidStatuses.Contains(s))
            .WithMessage("Status must be Approved, Rejected, or Completed.");

        RuleFor(x => x.Note)
            .MaximumLength(500).WithMessage("Note must not exceed 500 characters.")
            .When(x => x.Note != null);
    }
}
