using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Configurations;

public class UserShiftConfiguration : IEntityTypeConfiguration<UserShift>
{
    public void Configure(EntityTypeBuilder<UserShift> builder)
    {
        builder.ToTable("UserShifts");

        builder.HasKey(us => us.Id);
        builder.Property(us => us.Id).ValueGeneratedOnAdd();

        builder.Property(us => us.UserId).IsRequired();
        builder.Property(us => us.ShiftId).IsRequired();
        builder.Property(us => us.Date).IsRequired();

        // Unique constraint: a user can only be assigned to a shift once per day
        builder.HasIndex(us => new { us.UserId, us.ShiftId, us.Date })
            .IsUnique();

        builder.HasOne(us => us.User)
            .WithMany(u => u.UserShifts)
            .HasForeignKey(us => us.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(us => us.Shift)
            .WithMany(s => s.UserShifts)
            .HasForeignKey(us => us.ShiftId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(us => us.Attendances)
            .WithOne(a => a.UserShift)
            .HasForeignKey(a => a.UserShiftId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
