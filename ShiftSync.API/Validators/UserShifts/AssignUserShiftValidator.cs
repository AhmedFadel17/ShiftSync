using FluentValidation;
using ShiftSync.API.DTOs.UserShifts;

namespace ShiftSync.API.Validators.UserShifts;

public class AssignUserShiftValidator : AbstractValidator<AssignUserShiftDto>
{
    public AssignUserShiftValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.ShiftId)
            .GreaterThan(0).WithMessage("A valid Shift ID is required.");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required.")
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Cannot assign a shift to a past date.");
    }
}
