using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Models;
using RepairManagementApi.Enums;

namespace RepairManagementApi.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, string? ipAddress, string? deviceInfo);
    Task<AuthUserDto?> GetUserByIdAsync(Guid userId);
    Task<LoginResponseDto?> RefreshAsync(RefreshTokenRequestDto request, string? ipAddress, string? deviceInfo);
    Task LogoutAsync(RefreshTokenRequestDto request);
    Task<AuthUserDto?> CreateUserAsync(CreateUserRequestDto request);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IRefreshTokenService _refreshTokenService;

    public AuthService(
        AppDbContext db,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IRefreshTokenService refreshTokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _refreshTokenService = refreshTokenService;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, string? ipAddress, string? deviceInfo)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user is null || !user.IsActive)
            return null;

        if (user.LockoutEndUtc.HasValue && user.LockoutEndUtc.Value > DateTime.UtcNow)
            return null;

        var passwordValid = _passwordHasher.Verify(request.Password, user.PasswordHash);

        if (!passwordValid)
        {
            user.FailedLoginAttempts += 1;

            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutEndUtc = DateTime.UtcNow.AddMinutes(15);
                user.FailedLoginAttempts = 0;
            }

            user.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return null;
        }

        user.FailedLoginAttempts = 0;
        user.LockoutEndUtc = null;
        user.UpdatedAtUtc = DateTime.UtcNow;

        var accessToken = _jwtTokenService.CreateAccessToken(user);

        var rawRefreshToken = _refreshTokenService.GenerateRawToken();
        var refreshTokenEntity = _refreshTokenService.CreateRefreshToken(user.Id, rawRefreshToken, ipAddress, deviceInfo);

        _db.RefreshTokens.Add(refreshTokenEntity);
        await _db.SaveChangesAsync();

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            AccessTokenExpiresInSeconds = 900,
            RefreshTokenExpiresAt = refreshTokenEntity.ExpiresAtUtc,
            User = new AuthUserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                BranchId = user.BranchId
            }
        };
    }

    public async Task<AuthUserDto?> GetUserByIdAsync(Guid userId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user is null)
            return null;

        return new AuthUserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            BranchId = user.BranchId
        };
    }

    public async Task<LoginResponseDto?> RefreshAsync(RefreshTokenRequestDto request, string? ipAddress, string? deviceInfo)
    {
        var tokenHash = _refreshTokenService.HashToken(request.RefreshToken);

        var storedToken = await _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.TokenHash == tokenHash);

        if (storedToken is null
            || storedToken.RevokedAtUtc is not null
            || storedToken.ExpiresAtUtc <= DateTime.UtcNow
            || !storedToken.User.IsActive)
        {
            return null;
        }

        var newRawRefreshToken = _refreshTokenService.GenerateRawToken();
        var newRefreshTokenEntity = _refreshTokenService.CreateRefreshToken(
            storedToken.UserId, newRawRefreshToken, ipAddress, deviceInfo);

        _db.RefreshTokens.Add(newRefreshTokenEntity);

        storedToken.RevokedAtUtc = DateTime.UtcNow;
        storedToken.ReplacedByTokenId = newRefreshTokenEntity.Id;

        var newAccessToken = _jwtTokenService.CreateAccessToken(storedToken.User);

        await _db.SaveChangesAsync();

        return new LoginResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRawRefreshToken,
            AccessTokenExpiresInSeconds = 900,
            RefreshTokenExpiresAt = newRefreshTokenEntity.ExpiresAtUtc,
            User = new AuthUserDto
            {
                Id = storedToken.User.Id,
                FullName = storedToken.User.FullName,
                Email = storedToken.User.Email,
                Role = storedToken.User.Role.ToString(),
                BranchId = storedToken.User.BranchId
            }
        };
    }

    public async Task LogoutAsync(RefreshTokenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return;

        var tokenHash = _refreshTokenService.HashToken(request.RefreshToken);
        var storedToken = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == tokenHash);

        if (storedToken is null || storedToken.RevokedAtUtc is not null)
            return;

        storedToken.RevokedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<AuthUserDto?> CreateUserAsync(CreateUserRequestDto request)
    {
        // Validate role is Admin or Technician
        if (!Enum.TryParse<Role>(request.Role, ignoreCase: true, out var roleEnum))
            return null;

        // Normalize email and check for duplicates
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (existingUser is not null)
            return null;

        // Hash password
        var passwordHash = _passwordHasher.Hash(request.Password);

        var branchExists = await _db.Branches.AnyAsync(b => b.Id == request.BranchId);
        if (!branchExists) return null;

        // Create new user with secure defaults
        var newUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = passwordHash,
            Role = roleEnum,
            IsActive = true,
            FailedLoginAttempts = 0,
            LockoutEndUtc = null,
            MustChangePassword = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
            BranchId = request.BranchId,
        };

        _db.Users.Add(newUser);
        await _db.SaveChangesAsync();

        return new AuthUserDto
        {
            Id = newUser.Id,
            FullName = newUser.FullName,
            Email = newUser.Email,
            Role = newUser.Role.ToString(),
            BranchId = newUser.BranchId
        };
    }
}
