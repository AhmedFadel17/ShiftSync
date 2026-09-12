using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.Configurations;

public class AttendanceBreakConfiguration : IEntityTypeConfiguration<AttendanceBreak>
{
    public void Configure(EntityTypeBuilder<AttendanceBreak> builder)
    {
        builder.ToTable("AttendanceBreaks");

        builder.HasKey(ab => ab.Id);
        builder.Property(ab => ab.Id).ValueGeneratedOnAdd();

        builder.Property(ab => ab.AttendanceId).IsRequired();
        builder.Property(ab => ab.BreakTypeId).IsRequired();

        builder.Property(ab => ab.RequestTime)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(ab => ab.StartTime).IsRequired(false);
        builder.Property(ab => ab.EndTime).IsRequired(false);

        builder.Property(ab => ab.Status)
            .IsRequired()
            .HasDefaultValue(BreakStatus.Approved);

        builder.Property(ab => ab.Note)
            .HasMaxLength(500)
            .IsRequired(false);

        builder.HasIndex(ab => ab.AttendanceId);

        builder.HasOne(ab => ab.Attendance)
            .WithMany(a => a.Breaks)
            .HasForeignKey(ab => ab.AttendanceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ab => ab.BreakType)
            .WithMany(bt => bt.AttendanceBreaks)
            .HasForeignKey(ab => ab.BreakTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
