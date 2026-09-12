using FluentValidation;
using ShiftSync.API.DTOs.Shifts;

namespace ShiftSync.API.Validators.Shifts;

public class CreateShiftValidator : AbstractValidator<CreateShiftDto>
{
    public CreateShiftValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Shift name is required.")
            .MaximumLength(100).WithMessage("Shift name must not exceed 100 characters.");

        RuleFor(x => x.StartTime)
            .NotEqual(TimeSpan.Zero).WithMessage("Start time is required.");

        RuleFor(x => x.EndTime)
            .NotEqual(TimeSpan.Zero).WithMessage("End time is required.")
            .GreaterThan(x => x.StartTime).WithMessage("End time must be later than start time.");

        RuleFor(x => x.MaxAllowedBreaksDurationMinutes)
            .InclusiveBetween(0, 480).WithMessage("Max allowed breaks duration must be between 0 and 480 minutes.");

        RuleFor(x => x.MinActiveEmployeesRequired)
            .GreaterThanOrEqualTo(1).WithMessage("At least 1 active employee must be required.");
    }
}
