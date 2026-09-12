using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using ShiftSync.API.DTOs.Auth;
using ShiftSync.API.Models.Entities;
using ShiftSync.API.Models.Enums;

namespace ShiftSync.API.Services.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email)
            ?? throw new KeyNotFoundException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Your account has been deactivated. Please contact an administrator.");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
            throw new KeyNotFoundException("Invalid email or password.");

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new ArgumentException("An account with this email address already exists.");

        var user = new ApplicationUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            UserName = dto.Email,
            Role = UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            throw new ArgumentException(string.Join(" ", errors));
        }

        return BuildAuthResponse(user);
    }

    private AuthResponseDto BuildAuthResponse(ApplicationUser user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);
        var expiresAt = DateTime.UtcNow.AddMinutes(60);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new AuthResponseDto
        {
            Token = tokenHandler.WriteToken(token),
            ExpiresAt = expiresAt,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Role = user.Role.ToString()
        };
    }
}
