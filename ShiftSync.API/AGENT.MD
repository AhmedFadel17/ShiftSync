# AGENT.MD — ShiftSync API

> **Authoritative reference for all code generation, architecture decisions, and business rules.**
> Read this file in full before writing any code in this project.

---

## 1. Project Overview

**ShiftSync** is a .NET 9 REST API for workforce shift management and attendance tracking. It manages:
- **Shifts** — Named time windows (e.g., Morning Shift 09:00–17:00) with break budgets and headcount requirements.
- **UserShifts** — Assignment of an employee to a specific shift on a specific date.
- **Attendance** — GPS-stamped check-in/check-out records tied to a UserShift.
- **AttendanceBreaks** — Break requests within an attendance session (Lunch, Coffee, Prayer), subject to type-level and shift-level caps.
- **BreakTypes** — Configurable catalog of break categories with duration and occurrence limits.
- **Users** — ASP.NET Core Identity users with `Role` (Admin | User) and `IsActive` flag.

### Tech Stack

| Concern | Library / Version |
|---|---|
| Runtime | .NET 9 |
| Web Framework | ASP.NET Core 9 |
| ORM | Entity Framework Core 9 (SQL Server) |
| Identity | Microsoft.AspNetCore.Identity.EntityFrameworkCore |
| Auth | JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer) |
| Mapping | AutoMapper 16 |
| Validation | FluentValidation 12 |
| API Docs | Microsoft.AspNetCore.OpenApi |

---

## 2. Folder Structure

```
ShiftSync.API/
├── Common/                     # Shared utilities (currently empty; future: exception types)
├── Configurations/             # IEntityTypeConfiguration<T> per entity (EF Fluent API)
├── Controllers/                # One controller per domain, inherits ApiBaseController
├── Data/
│   ├── ApplicationDbContext.cs
│   └── Migrations/
├── DTOs/
│   ├── Common/                 # Shared: ApiResponseDto, PaginationResponseDto, BaseFilterDto…
│   ├── Attendances/
│   ├── AttendanceBreaks/
│   ├── Auth/
│   ├── BreakTypes/
│   ├── Shifts/
│   └── UserShifts/
├── Factories/
│   └── ApiResponseFactory.cs   # Static Success<T> / Error helpers
├── Helpers/
│   └── PaginationHelper.cs
├── Mappings/
│   ├── MappingProfile.cs       # Single AutoMapper Profile for ALL mappings
│   └── PaginationConverter.cs
├── Middlewares/
│   └── ExceptionHandlerMiddleware.cs
├── Models/
│   ├── Entities/               # EF Core entity classes
│   └── Enums/
├── Repositories/
│   ├── BaseRepository.cs / IBaseRepository.cs
│   └── {Domain}/               # IXxxRepository, XxxRepository per entity
├── Services/
│   └── {Domain}/               # IXxxService, XxxService per domain
├── Validators/
│   └── {Domain}/               # CreateXxxValidator, UpdateXxxValidator per DTO
├── Program.cs
└── appsettings.json
```

---

## 3. Database Schema

### `AspNetUsers` (Identity — mapped to `ApplicationUser`)
| Column | Type | Notes |
|---|---|---|
| Id | nvarchar(450) | PK (string, Identity default) |
| UserName | nvarchar(256) | Unique |
| Email | nvarchar(256) | |
| FullName | nvarchar(200) | Required |
| Role | int | Enum: User=1, Admin=2 |
| IsActive | bit | Default true |
| CreatedAt | datetime2 | Default UtcNow |

### `Shifts`
| Column | Type | Notes |
|---|---|---|
| Id | int | PK, Identity |
| Name | nvarchar(100) | Required, Unique |
| StartTime | time | Required |
| EndTime | time | Required, must be > StartTime |
| MaxAllowedBreaksDurationMinutes | int | Default 60, ≥ 0 |
| MinActiveEmployeesRequired | int | Default 2, ≥ 1 |
| IsActive | bit | Default true |

### `UserShifts`
| Column | Type | Notes |
|---|---|---|
| Id | int | PK, Identity |
| UserId | nvarchar(450) | FK → AspNetUsers.Id |
| ShiftId | int | FK → Shifts.Id |
| Date | date | The calendar date of the shift |
| **Unique** | (UserId, ShiftId, Date) | Cannot double-assign |

### `Attendances`
| Column | Type | Notes |
|---|---|---|
| Id | int | PK, Identity |
| UserId | nvarchar(450) | FK → AspNetUsers.Id |
| UserShiftId | int | FK → UserShifts.Id |
| CheckInTime | datetime2 | Required |
| CheckInLatitude | float | Required |
| CheckInLongitude | float | Required |
| CheckOutTime | datetime2? | Nullable until checkout |
| CheckOutLatitude | float? | Nullable |
| CheckOutLongitude | float? | Nullable |

### `BreakTypes`
| Column | Type | Notes |
|---|---|---|
| Id | int | PK, Identity |
| Name | nvarchar(100) | Required, Unique |
| MaxDurationMinutes | int | 1–480 |
| MaxOccurrencesPerShift | int | 1–10, Default 1 |
| IsActive | bit | Default true |

### `AttendanceBreaks`
| Column | Type | Notes |
|---|---|---|
| Id | int | PK, Identity |
| AttendanceId | int | FK → Attendances.Id |
| BreakTypeId | int | FK → BreakTypes.Id |
| RequestTime | datetime2 | Default UtcNow |
| StartTime | datetime2? | Set when approved |
| EndTime | datetime2? | Set when completed |
| Status | int | Enum: Approved=1, WaitingQueue=2, Rejected=3, Completed=4 |
| Note | nvarchar(500)? | Optional supervisor note |

---

## 4. Entity Relationships

```
ApplicationUser ──< UserShift >── Shift
ApplicationUser ──< Attendance
UserShift       ──< Attendance ──< AttendanceBreak >── BreakType
```

---

## 5. Business Rules

### Shifts
- `Name` must be unique across all shifts (case-insensitive).
- `EndTime` must be strictly greater than `StartTime`.
- Deleting a shift is a **soft delete** (`IsActive = false`); never physically delete.
- A shift with active `UserShift` assignments on today or future dates cannot be deactivated.

### UserShifts
- A user can only be assigned to one shift per date (unique constraint `UserId + ShiftId + Date`).
- The assigned `Shift` must be `IsActive = true`.
- The assigned `ApplicationUser` must be `IsActive = true`.
- Assignment is **Admin-only** (`[Authorize(Roles = "Admin")]`).
- Deletion of a UserShift is physical only if no Attendance records exist; otherwise throw `InvalidOperationException`.

### Attendance (Check-In / Check-Out)
- A user cannot check in if they have an open attendance record (no `CheckOutTime`) for the same `UserShift`.
- A user cannot check out without a prior check-in.
- Check-in is only allowed within a ±15 minute grace window around the shift's `StartTime` on the assigned `Date`.
- Both check-in and check-out must include valid GPS coordinates (latitude −90..90, longitude −180..180).
- A `UserShift` can only ever have **one** non-checked-out Attendance at a time.

### AttendanceBreaks
- A break can only be requested if the user has an open check-in (no `CheckOutTime`).
- The `BreakType.MaxDurationMinutes` is enforced when the break is completed (`EndTime - StartTime`).
- `BreakType.MaxOccurrencesPerShift` is enforced on request; count existing breaks of the same type within the same attendance.
- The total duration of all **Completed** breaks for the session must not exceed `Shift.MaxAllowedBreaksDurationMinutes`.
- Before approving (`WaitingQueue → Approved`), the number of employees **currently on a break** must leave at least `Shift.MinActiveEmployeesRequired` active employees. If insufficient, the break stays in `WaitingQueue`.
- Status transitions: `WaitingQueue → Approved`, `WaitingQueue → Rejected`, `Approved → Completed`. No other transitions are valid.

### BreakTypes
- `Name` must be unique (case-insensitive).
- Soft-delete only (`IsActive = false`).
- A BreakType with existing AttendanceBreak records cannot be hard-deleted.

### Auth
- Users register with `email`, `password`, `fullName`.
- Default role on registration: `User`.
- JWT tokens expire in **60 minutes**. Refresh tokens are out of scope for this version.
- Passwords must be ≥ 8 chars, contain at least 1 uppercase, 1 lowercase, 1 digit.

---

## 6. Code Generation Conventions

### 6.1 Namespaces
- Always match the folder path: `ShiftSync.API.{Folder}.{SubFolder}`.
- Example: `ShiftSync.API.Services.Attendances`, `ShiftSync.API.DTOs.AttendanceBreaks`.

### 6.2 DTOs
- Use `record` types for all DTOs (immutable, value-equality).
- **Request DTOs**: `CreateXxxDto`, `UpdateXxxDto` (nullable fields for partial updates).
- **Response DTOs**: `XxxResponseDto` — flat, no circular references, no entity types exposed.
- **Filter DTOs**: `XxxFilterDto : BaseFilterDto` — add domain-specific filter properties.
- Never expose `ICollection<>` navigation properties in response DTOs — use counts or nested flat DTOs.
- File-scoped namespaces (`namespace ShiftSync.API.DTOs.Xxx;`).

### 6.3 Validators (FluentValidation)
- One validator class per DTO: `CreateXxxValidator`, `UpdateXxxValidator`.
- Inherit `AbstractValidator<TDto>`.
- Rules in constructor only — no custom methods unless reused.
- `UpdateXxxValidator`: wrap rules with `When(x => x.Field != null, ...)` for nullable fields.
- Validators are auto-registered via `AddValidatorsFromAssemblyContaining<CreateShiftValidator>()`.

### 6.4 Repositories
- Domain interface: `IXxxRepository : IBaseRepository<XxxEntity>` — only add methods not covered by base.
- Domain implementation: `XxxRepository : BaseRepository<XxxEntity>, IXxxRepository`.
- Use `Query()` + LINQ for custom queries; never write raw SQL.
- Paged queries return `PaginationSource<TEntity>` (not `PaginationResponseDto` — mapping is AutoMapper's job).
- Constructor takes only `ApplicationDbContext context` and calls `base(context)`.

### 6.5 Services
- Interface: `IXxxService` with full async contract.
- Implementation: `XxxService : IXxxService`.
- Constructor-inject `IXxxRepository`, `IMapper`, and any cross-domain repositories needed.
- **Never inject DbContext directly** into a service — always go through repositories.
- Throw `KeyNotFoundException` for not-found entities (middleware maps → 404).
- Throw `ArgumentException` for business rule violations (middleware maps → 400).
- Throw `InvalidOperationException` for state conflicts (middleware maps → 400).
- Throw `ValidationException` (FluentValidation) for DTO validation failures (middleware maps → 422).
- All methods are `async Task<T>` with `CancellationToken cancellationToken = default`.

### 6.6 Controllers
- Inherit `ApiBaseController`.
- Route: `[Route("api/[controller]")]`.
- Constructor-inject only the domain service (`IXxxService`).
- **Never** inject repositories or DbContext into controllers.
- Return `IActionResult` (not `ActionResult<T>`) for consistency.
- Use `ApiResponseFactory.Success(...)` / `ApiResponseFactory.Error(...)` for all responses.
- Wrap create responses: `return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponseFactory.Success(result, statusCode: 201))`.
- Apply `[Authorize]` at controller level; use `[AllowAnonymous]` on specific actions if needed.
- Apply `[Authorize(Roles = "Admin")]` for admin-only actions.

### 6.7 AutoMapper
- All mappings live in a **single** `MappingProfile.cs`.
- `CreateMap<Entity, ResponseDto>()` and `CreateMap<CreateDto, Entity>()` minimum pair.
- Computed properties (e.g., `DurationHours`) use `.ForMember(dest => dest.X, opt => opt.MapFrom(...))`.
- Update maps use `.ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null))` for partial updates.
- The `PaginationSource<T> → PaginationResponseDto<T>` generic converter is already wired — don't duplicate.

### 6.8 EF Core Configurations
- One `IEntityTypeConfiguration<TEntity>` class per entity in `Configurations/`.
- Applied via `builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly)` in `OnModelCreating`.
- Use Fluent API exclusively — no `[DataAnnotations]` on entity classes.
- Always define: table name, required columns, max lengths, FK constraints, indexes (especially unique).

### 6.9 Exception Handling
- **Never** use try/catch in services or controllers for expected business exceptions.
- The `ExceptionHandlerMiddleware` catches all exceptions and maps to HTTP status codes:
  - `KeyNotFoundException` → 404
  - `ValidationException` → 422 (with field-level errors dict)
  - `ArgumentException` → 400
  - `UnauthorizedAccessException` → 401
  - Everything else → 500

### 6.10 Naming Conventions
- **Entities**: `PascalCase`, singular (`Shift`, `Attendance`, not `Shifts`).
- **DbSet properties**: plural (`Shifts`, `Attendances`).
- **Controllers**: plural (`ShiftsController`, `AttendancesController`).
- **Service/Repo folders**: plural (`Services/Shifts/`, `Repositories/Attendances/`).
- **Private fields**: `_camelCase` prefix.
- **Async methods**: always suffix with `Async`.

---

## 7. Auth & Authorization

- JWT Bearer: `Authorization: Bearer <token>`.
- Roles: `"Admin"`, `"User"` (from `UserRole` enum `.ToString()`).
- `[Authorize]` on all controllers by default.
- `[AllowAnonymous]` on `AuthController` actions (`/login`, `/register`).
- `[Authorize(Roles = "Admin")]` on admin-only endpoints (UserShift assignment, BreakType management).
- `ApiBaseController` exposes helpers: `CurrentUserId` (string?), `IsAdmin` (bool).

---

## 8. Pagination Pattern

Services return `PaginationSource<TEntity>`, which AutoMapper converts to `PaginationResponseDto<TResponseDto>` via the `PaginationConverter<,>` registered in `MappingProfile`. Controllers call:

```csharp
var source = await _service.GetPagedAsync(filter, cancellationToken);
var result = _mapper.Map<PaginationResponseDto<XxxResponseDto>>(source);
return Ok(ApiResponseFactory.Success(result));
```

---

## 9. Dependency Injection Registration Pattern

All registrations go in `Program.cs` in this order:
1. DbContext
2. Identity + JWT
3. AutoMapper
4. FluentValidation
5. HttpContextAccessor (if needed)
6. Generic `IBaseRepository<>` → `BaseRepository<>`
7. Domain-specific repositories (scoped)
8. Domain-specific services (scoped)

---

## 10. Seed Data

Defined in `ApplicationDbContext.OnModelCreating`:
- 1 Admin user (`Id = "admin"`, `UserName = "admin"`)
- 10 regular users (`Id = "1"` – `"10"`)
- 3 BreakTypes: Lunch (30 min, 1x), Coffee/Rest (15 min, 2x), Prayer (15 min, 2x)
- 1 default Shift: Morning Shift 09:00–17:00

> **Never** add seed data outside `ApplicationDbContext`. If new seed data is needed, add it to the `HasData` calls in `OnModelCreating` and create a new migration.
