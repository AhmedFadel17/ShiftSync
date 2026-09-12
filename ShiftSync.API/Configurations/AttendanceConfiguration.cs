using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Configurations;

public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
{
    public void Configure(EntityTypeBuilder<Attendance> builder)
    {
        builder.ToTable("Attendances");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedOnAdd();

        builder.Property(a => a.UserId).IsRequired();
        builder.Property(a => a.UserShiftId).IsRequired();

        builder.Property(a => a.CheckInTime).IsRequired();
        builder.Property(a => a.CheckInLatitude).IsRequired();
        builder.Property(a => a.CheckInLongitude).IsRequired();

        builder.Property(a => a.CheckOutTime).IsRequired(false);
        builder.Property(a => a.CheckOutLatitude).IsRequired(false);
        builder.Property(a => a.CheckOutLongitude).IsRequired(false);

        builder.HasIndex(a => a.UserShiftId);
        builder.HasIndex(a => a.UserId);

        builder.HasOne(a => a.User)
            .WithMany(u => u.Attendances)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.UserShift)
            .WithMany(us => us.Attendances)
            .HasForeignKey(a => a.UserShiftId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.Breaks)
            .WithOne(b => b.Attendance)
            .HasForeignKey(b => b.AttendanceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
