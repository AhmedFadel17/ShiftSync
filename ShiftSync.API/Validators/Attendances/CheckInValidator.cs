using FluentValidation;
using ShiftSync.API.DTOs.Attendances;

namespace ShiftSync.API.Validators.Attendances;

public class CheckInValidator : AbstractValidator<CheckInDto>
{
    public CheckInValidator()
    {
        RuleFor(x => x.UserShiftId)
            .GreaterThan(0).WithMessage("A valid UserShift ID is required.");

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180.");
    }
}
