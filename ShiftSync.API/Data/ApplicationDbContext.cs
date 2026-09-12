using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
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

        // Apply all IEntityTypeConfiguration classes
        // from the Configurations folder
        builder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly
        );

        var hasher = new PasswordHasher<ApplicationUser>();

        var fixedDate = new DateTime(
            2026,
            1,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc
        );

        // =========================================================
        // 1. Seed Roles
        // =========================================================

        var adminRoleId = "role-admin-id";
        var userRoleId = "role-user-id";

        builder.Entity<IdentityRole>().HasData(
            new IdentityRole
            {
                Id = adminRoleId,
                Name = "Admin",
                NormalizedName = "ADMIN"
            },
            new IdentityRole
            {
                Id = userRoleId,
                Name = "User",
                NormalizedName = "USER"
            }
        );

        // =========================================================
        // 2. Seed Admin User
        // Password: Admin@123
        // =========================================================

        var adminUser = new ApplicationUser
        {
            Id = "admin-user-id",
            UserName = "admin@shiftsync.com",
            NormalizedUserName = "ADMIN@SHIFTSYNC.COM",
            Email = "admin@shiftsync.com",
            NormalizedEmail = "ADMIN@SHIFTSYNC.COM",

            FullName = "System Admin",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = fixedDate,

            EmailConfirmed = true,

            SecurityStamp = "STATIC-SECURITY-STAMP-ADMIN",
            ConcurrencyStamp = "STATIC-CONCURRENCY-STAMP-ADMIN"
        };

        adminUser.PasswordHash = hasher.HashPassword(
            adminUser,
            "Admin@123"
        );

        builder.Entity<ApplicationUser>().HasData(adminUser);

        // Assign Admin role
        builder.Entity<IdentityUserRole<string>>().HasData(
            new IdentityUserRole<string>
            {
                RoleId = adminRoleId,
                UserId = adminUser.Id
            }
        );

        // =========================================================
        // 3. Seed 10 Employees
        // Password: User@123
        // =========================================================

        var users = new List<ApplicationUser>();

        var userRolesMapping = new List<IdentityUserRole<string>>();

        for (int i = 1; i <= 10; i++)
        {
            var userId = $"user-id-{i}";

            var user = new ApplicationUser
            {
                Id = userId,

                UserName = $"user{i}@shiftsync.com",
                NormalizedUserName = $"USER{i}@SHIFTSYNC.COM",

                Email = $"user{i}@shiftsync.com",
                NormalizedEmail = $"USER{i}@SHIFTSYNC.COM",

                FullName = $"Employee {i}",
                Role = UserRole.User,
                IsActive = true,
                CreatedAt = fixedDate,

                EmailConfirmed = true,

                SecurityStamp = $"STATIC-SECURITY-STAMP-{i}",
                ConcurrencyStamp = $"STATIC-CONCURRENCY-STAMP-{i}"
            };

            user.PasswordHash = hasher.HashPassword(
                user,
                "User@123"
            );

            users.Add(user);

            userRolesMapping.Add(
                new IdentityUserRole<string>
                {
                    RoleId = userRoleId,
                    UserId = userId
                }
            );
        }

        builder.Entity<ApplicationUser>().HasData(users);

        builder.Entity<IdentityUserRole<string>>()
            .HasData(userRolesMapping);

        // =========================================================
        // 4. Seed Initial Break Types
        // =========================================================

        builder.Entity<BreakType>().HasData(
            new BreakType
            {
                Id = 1,
                Name = "Lunch Break",
                MaxDurationMinutes = 30,
                MaxOccurrencesPerShift = 1
            },
            new BreakType
            {
                Id = 2,
                Name = "Coffee / Rest Break",
                MaxDurationMinutes = 15,
                MaxOccurrencesPerShift = 2
            },
            new BreakType
            {
                Id = 3,
                Name = "Prayer Break",
                MaxDurationMinutes = 15,
                MaxOccurrencesPerShift = 2
            }
        );

        // =========================================================
        // 5. Seed Default Shift
        // =========================================================

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