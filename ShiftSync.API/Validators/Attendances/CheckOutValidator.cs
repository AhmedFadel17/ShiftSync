using FluentValidation;
using ShiftSync.API.DTOs.Attendances;

namespace ShiftSync.API.Validators.Attendances;

public class CheckOutValidator : AbstractValidator<CheckOutDto>
{
    public CheckOutValidator()
    {
        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180.");
    }
}
