using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.Controllers;


[ApiController]
public abstract class ApiBaseController : ControllerBase
{

    protected string? CurrentUserId =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
        User.FindFirst("sub")?.Value;
    protected bool IsAdmin => User.IsInRole(UserRole.Admin.ToString());
    protected Guid CurrentUserGuid => Guid.TryParse(CurrentUserId, out var guid) ? guid : Guid.Empty;
}

