using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Shift> Shifts { get; set; } = null!;
    public DbSet<UserShift> UserShifts { get; set; } = null!;
    public DbSet<Attendance> Attendances { get; set; } = null!;
    public DbSet<BreakType> BreakTypes { get; set; } = null!;
    public DbSet<AttendanceBreak> AttendanceBreaks { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Apply all IEntityTypeConfiguration<T> classes from Configurations/ folder
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        //seed Admin User
        var adminUser = new ApplicationUser
        {
            Id = "admin",
            UserName = "admin",
            NormalizedUserName = "ADMIN",
            Email = "[EMAIL_ADDRESS]",
            NormalizedEmail = "[EMAIL_ADDRESS]",
            FullName = "Admin",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            EmailConfirmed = true
        };

        builder.Entity<ApplicationUser>().HasData(adminUser);

        //seed 10 Users
        var users = new List<ApplicationUser>();
        for (int i = 1; i <= 10; i++)
        {
            users.Add(new ApplicationUser
            {
                Id = i.ToString(),
                UserName = $"user{i}",
                NormalizedUserName = $"USER{i}",
                Email = $"[EMAIL_ADDRESS]",
                NormalizedEmail = $"[EMAIL_ADDRESS]",
                FullName = $"User {i}",
                Role = UserRole.User,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                EmailConfirmed = true
            });
        }

        builder.Entity<ApplicationUser>().HasData(users);

        // Seed Initial Break Types
        builder.Entity<BreakType>().HasData(
            new BreakType { Id = 1, Name = "Lunch Break", MaxDurationMinutes = 30, MaxOccurrencesPerShift = 1 },
            new BreakType { Id = 2, Name = "Coffee / Rest Break", MaxDurationMinutes = 15, MaxOccurrencesPerShift = 2 },
            new BreakType { Id = 3, Name = "Prayer Break", MaxDurationMinutes = 15, MaxOccurrencesPerShift = 2 }
        );

        // Seed Default Shift
        builder.Entity<Shift>().HasData(
            new Shift
            {
                Id = 1,
                Name = "Morning Shift",
                StartTime = new TimeSpan(9, 0, 0),
                EndTime = new TimeSpan(17, 0, 0),
                MaxAllowedBreaksDurationMinutes = 60,
                MinActiveEmployeesRequired = 2
            }
        );
    }
}
