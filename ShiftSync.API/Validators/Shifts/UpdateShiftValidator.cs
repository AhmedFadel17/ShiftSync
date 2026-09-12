using FluentValidation;
using ShiftSync.API.DTOs.Shifts;

namespace ShiftSync.API.Validators.Shifts;

public class UpdateShiftValidator : AbstractValidator<UpdateShiftDto>
{
    public UpdateShiftValidator()
    {
        When(x => x.Name != null, () =>
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Shift name cannot be empty.")
                .MaximumLength(100).WithMessage("Shift name must not exceed 100 characters.");
        });

        When(x => x.StartTime.HasValue && x.EndTime.HasValue, () =>
        {
            RuleFor(x => x.EndTime)
                .GreaterThan(x => x.StartTime).WithMessage("End time must be later than start time.");
        });

        When(x => x.MaxAllowedBreaksDurationMinutes.HasValue, () =>
        {
            RuleFor(x => x.MaxAllowedBreaksDurationMinutes!.Value)
                .InclusiveBetween(0, 480).WithMessage("Max allowed breaks duration must be between 0 and 480 minutes.");
        });

        When(x => x.MinActiveEmployeesRequired.HasValue, () =>
        {
            RuleFor(x => x.MinActiveEmployeesRequired!.Value)
                .GreaterThanOrEqualTo(1).WithMessage("At least 1 active employee must be required.");
        });
    }
}
