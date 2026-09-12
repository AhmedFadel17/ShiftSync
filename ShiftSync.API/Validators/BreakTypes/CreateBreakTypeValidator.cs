using FluentValidation;
using ShiftSync.API.DTOs.BreakTypes;

namespace ShiftSync.API.Validators.BreakTypes;

public class CreateBreakTypeValidator : AbstractValidator<CreateBreakTypeDto>
{
    public CreateBreakTypeValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Break type name is required.")
            .MaximumLength(100).WithMessage("Break type name must not exceed 100 characters.");

        RuleFor(x => x.MaxDurationMinutes)
            .InclusiveBetween(1, 480).WithMessage("Max duration must be between 1 and 480 minutes.");

        RuleFor(x => x.MaxOccurrencesPerShift)
            .InclusiveBetween(1, 10).WithMessage("Max occurrences must be between 1 and 10.");
    }
}
