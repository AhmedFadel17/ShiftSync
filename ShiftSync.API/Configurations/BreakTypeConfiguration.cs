using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiftSync.API.Models.Entities;

namespace ShiftSync.API.Configurations;

public class BreakTypeConfiguration : IEntityTypeConfiguration<BreakType>
{
    public void Configure(EntityTypeBuilder<BreakType> builder)
    {
        builder.ToTable("BreakTypes");

        builder.HasKey(bt => bt.Id);
        builder.Property(bt => bt.Id).ValueGeneratedOnAdd();

        builder.Property(bt => bt.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(bt => bt.Name).IsUnique();

        builder.Property(bt => bt.MaxDurationMinutes).IsRequired();

        builder.Property(bt => bt.MaxOccurrencesPerShift)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(bt => bt.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasMany(bt => bt.AttendanceBreaks)
            .WithOne(ab => ab.BreakType)
            .HasForeignKey(ab => ab.BreakTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
