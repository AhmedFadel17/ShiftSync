using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ShiftSync.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BreakTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MaxDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    MaxOccurrencesPerShift = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BreakTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Shifts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    MaxAllowedBreaksDurationMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 60),
                    MinActiveEmployeesRequired = table.Column<int>(type: "int", nullable: false, defaultValue: 2),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shifts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserShifts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ShiftId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserShifts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserShifts_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserShifts_Shifts_ShiftId",
                        column: x => x.ShiftId,
                        principalTable: "Shifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Attendances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserShiftId = table.Column<int>(type: "int", nullable: false),
                    CheckInTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckInLatitude = table.Column<double>(type: "float", nullable: false),
                    CheckInLongitude = table.Column<double>(type: "float", nullable: false),
                    CheckOutTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckOutLatitude = table.Column<double>(type: "float", nullable: true),
                    CheckOutLongitude = table.Column<double>(type: "float", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attendances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Attendances_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Attendances_UserShifts_UserShiftId",
                        column: x => x.UserShiftId,
                        principalTable: "UserShifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceBreaks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AttendanceId = table.Column<int>(type: "int", nullable: false),
                    BreakTypeId = table.Column<int>(type: "int", nullable: false),
                    RequestTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceBreaks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceBreaks_Attendances_AttendanceId",
                        column: x => x.AttendanceId,
                        principalTable: "Attendances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttendanceBreaks_BreakTypes_BreakTypeId",
                        column: x => x.BreakTypeId,
                        principalTable: "BreakTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "role-admin-id", null, "Admin", "ADMIN" },
                    { "role-user-id", null, "User", "USER" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "CreatedAt", "Email", "EmailConfirmed", "FullName", "IsActive", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "Role", "SecurityStamp", "TwoFactorEnabled", "UserName" },
                values: new object[,]
                {
                    { "admin-user-id", 0, "STATIC-CONCURRENCY-STAMP-ADMIN", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@shiftsync.com", true, "System Admin", true, false, null, "ADMIN@SHIFTSYNC.COM", "ADMIN@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAEJfropylbyoTYOQf2UlxRMapTVFNyKW6A9XwBy19rYxzFzG8iVDZd/MEAwazCyCGkw==", null, false, 2, "STATIC-SECURITY-STAMP-ADMIN", false, "admin@shiftsync.com" },
                    { "user-id-1", 0, "STATIC-CONCURRENCY-STAMP-1", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "user1@shiftsync.com", true, "Employee 1", true, false, null, "USER1@SHIFTSYNC.COM", "USER1@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAEMTxYc2jJMp6ry6CtBMplD3jdMXf7H/9MUgPRJp9HbCtrCARQpDHcv4InkhNsmm1VQ==", null, false, 1, "STATIC-SECURITY-STAMP-1", false, "user1@shiftsync.com" },
                    { "user-id-10", 0, "STATIC-CONCURRENCY-STAMP-10", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "user10@shiftsync.com", true, "Employee 10", true, false, null, "USER10@SHIFTSYNC.COM", "USER10@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAEKZfvPTLTTrLV4pOLJYL8tcEvBM9UiZRZF04OgWTKKjFubVsW3tZVDsaH/3bf2KO6A==", null, false, 1, "STATIC-SECURITY-STAMP-10", false, "user10@shiftsync.com" },
                    { "user-id-2", 0, "STATIC-CONCURRENCY-STAMP-2", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "user2@shiftsync.com", true, "Employee 2", true, false, null, "USER2@SHIFTSYNC.COM", "USER2@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAEIYA6PaYrYWwXLGzNadkdYpSer6YM+pIlLmvKPc4bAS7HmAau3WXff+PZEUjr8ODCg==", null, false, 1, "STATIC-SECURITY-STAMP-2", false, "user2@shiftsync.com" },
                    { "user-id-3", 0, "STATIC-CONCURRENCY-STAMP-3", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "user3@shiftsync.com", true, "Employee 3", true, false, null, "USER3@SHIFTSYNC.COM", "USER3@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAENUK9z7ygMpteFoLJxzZi4XBJcv+stgBFF+ab+gxi6fvNndlOYzgLZmY76hgF3GssQ==", null, false, 1, "STATIC-SECURITY-STAMP-3", false, "user3@shiftsync.com" },
                    { "user-id-4", 0, "STATIC-CONCURRENCY-STAMP-4", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "user4@shiftsync.com", true, "Employee 4", true, false, null, "USER4@SHIFTSYNC.COM", "USER4@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAEI6pnVP5oeAsqXgm22sggvkgW95lT/DPl7f+1mpghUijLQfdkzZi+ObXRROGQ/qBOg==", null, false, 1, "STATIC-SECURITY-STAMP-4", false, "user4@shiftsync.com" },
                    { "user-id-5", 0, "STATIC-CONCURRENCY-STAMP-5", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "user5@shiftsync.com", true, "Employee 5", true, false, null, "USER5@SHIFTSYNC.COM", "USER5@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAEG3R5/suLiTrKBhirDUfyjp/NbHn9+HFGAqvEAH9gxiIgPhIM5taTziO7gPI/Srqpw==", null, false, 1, "STATIC-SECURITY-STAMP-5", false, "user5@shiftsync.com" },
                    { "user-id-6", 0, "STATIC-CONCURRENCY-STAMP-6", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "user6@shiftsync.com", true, "Employee 6", true, false, null, "USER6@SHIFTSYNC.COM", "USER6@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAEPICG5yCSDV1/79AVN1HbpHnqanjeMkkRYFIKPaLKiX5np+AF99mu45r1ysTo6xz6w==", null, false, 1, "STATIC-SECURITY-STAMP-6", false, "user6@shiftsync.com" },
                    { "user-id-7", 0, "STATIC-CONCURRENCY-STAMP-7", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "user7@shiftsync.com", true, "Employee 7", true, false, null, "USER7@SHIFTSYNC.COM", "USER7@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAEE5wBEjeZha2PiqRy0clIANvG7ZweWruLhqcQSsIpwY44y27mbQzXenbHEsneQABEg==", null, false, 1, "STATIC-SECURITY-STAMP-7", false, "user7@shiftsync.com" },
                    { "user-id-8", 0, "STATIC-CONCURRENCY-STAMP-8", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "user8@shiftsync.com", true, "Employee 8", true, false, null, "USER8@SHIFTSYNC.COM", "USER8@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAENRkhKj2KXFZSl1pCHy8bqTz5cyZrIJKWf6bDW72GZp3AGfeZYJLZVVb3goTB4y94Q==", null, false, 1, "STATIC-SECURITY-STAMP-8", false, "user8@shiftsync.com" },
                    { "user-id-9", 0, "STATIC-CONCURRENCY-STAMP-9", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "user9@shiftsync.com", true, "Employee 9", true, false, null, "USER9@SHIFTSYNC.COM", "USER9@SHIFTSYNC.COM", "AQAAAAIAAYagAAAAEPxja25BPsrVrV7g0vu+4ANnL51Y/MhydDOs3l/w1TLpKjl/6++R+/zXzZLk65+4SQ==", null, false, 1, "STATIC-SECURITY-STAMP-9", false, "user9@shiftsync.com" }
                });

            migrationBuilder.InsertData(
                table: "BreakTypes",
                columns: new[] { "Id", "IsActive", "MaxDurationMinutes", "MaxOccurrencesPerShift", "Name" },
                values: new object[,]
                {
                    { 1, true, 30, 1, "Lunch Break" },
                    { 2, true, 15, 2, "Coffee / Rest Break" },
                    { 3, true, 15, 2, "Prayer Break" }
                });

            migrationBuilder.InsertData(
                table: "Shifts",
                columns: new[] { "Id", "EndTime", "IsActive", "MaxAllowedBreaksDurationMinutes", "MinActiveEmployeesRequired", "Name", "StartTime" },
                values: new object[] { 1, new TimeSpan(0, 17, 0, 0, 0), true, 60, 2, "Morning Shift", new TimeSpan(0, 9, 0, 0, 0) });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[,]
                {
                    { "role-admin-id", "admin-user-id" },
                    { "role-user-id", "user-id-1" },
                    { "role-user-id", "user-id-10" },
                    { "role-user-id", "user-id-2" },
                    { "role-user-id", "user-id-3" },
                    { "role-user-id", "user-id-4" },
                    { "role-user-id", "user-id-5" },
                    { "role-user-id", "user-id-6" },
                    { "role-user-id", "user-id-7" },
                    { "role-user-id", "user-id-8" },
                    { "role-user-id", "user-id-9" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceBreaks_AttendanceId",
                table: "AttendanceBreaks",
                column: "AttendanceId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceBreaks_BreakTypeId",
                table: "AttendanceBreaks",
                column: "BreakTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_UserId",
                table: "Attendances",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_UserShiftId",
                table: "Attendances",
                column: "UserShiftId");

            migrationBuilder.CreateIndex(
                name: "IX_BreakTypes_Name",
                table: "BreakTypes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_Name",
                table: "Shifts",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserShifts_ShiftId",
                table: "UserShifts",
                column: "ShiftId");

            migrationBuilder.CreateIndex(
                name: "IX_UserShifts_UserId_ShiftId_Date",
                table: "UserShifts",
                columns: new[] { "UserId", "ShiftId", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "AttendanceBreaks");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Attendances");

            migrationBuilder.DropTable(
                name: "BreakTypes");

            migrationBuilder.DropTable(
                name: "UserShifts");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Shifts");
        }
    }
}
