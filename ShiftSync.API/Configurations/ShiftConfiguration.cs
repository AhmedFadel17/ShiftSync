using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Configurations;

public class ShiftConfiguration : IEntityTypeConfiguration<Shift>
{
    public void Configure(EntityTypeBuilder<Shift> builder)
    {
        builder.ToTable("Shifts");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedOnAdd();

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(s => s.Name).IsUnique();

        builder.Property(s => s.StartTime).IsRequired();
        builder.Property(s => s.EndTime).IsRequired();

        builder.Property(s => s.MaxAllowedBreaksDurationMinutes)
            .IsRequired()
            .HasDefaultValue(60);

        builder.Property(s => s.MinActiveEmployeesRequired)
            .IsRequired()
            .HasDefaultValue(2);

        builder.Property(s => s.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasMany(s => s.UserShifts)
            .WithOne(us => us.Shift)
            .HasForeignKey(us => us.ShiftId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
