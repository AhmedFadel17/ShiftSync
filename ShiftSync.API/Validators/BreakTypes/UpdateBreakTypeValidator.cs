using FluentValidation;
using ShiftSync.API.DTOs.BreakTypes;

namespace ShiftSync.API.Validators.BreakTypes;

public class UpdateBreakTypeValidator : AbstractValidator<UpdateBreakTypeDto>
{
    public UpdateBreakTypeValidator()
    {
        When(x => x.Name != null, () =>
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Break type name cannot be empty.")
                .MaximumLength(100).WithMessage("Break type name must not exceed 100 characters.");
        });

        When(x => x.MaxDurationMinutes.HasValue, () =>
        {
            RuleFor(x => x.MaxDurationMinutes!.Value)
                .InclusiveBetween(1, 480).WithMessage("Max duration must be between 1 and 480 minutes.");
        });

        When(x => x.MaxOccurrencesPerShift.HasValue, () =>
        {
            RuleFor(x => x.MaxOccurrencesPerShift!.Value)
                .InclusiveBetween(1, 10).WithMessage("Max occurrences must be between 1 and 10.");
        });
    }
}
