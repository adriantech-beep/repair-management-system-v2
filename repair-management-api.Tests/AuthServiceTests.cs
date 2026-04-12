using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;
using RepairManagementApi.Models;
using RepairManagementApi.Services;

namespace repair_management_api.Tests;

public class AuthServiceTests
{
    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsTokenPair()
    {
        await using var db = CreateDbContext();
        var service = CreateAuthService(db);

        var user = CreateUser("admin@repairmanagement.local", "AdminPassword123!", Role.Admin);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var result = await service.LoginAsync(new LoginRequestDto
        {
            Email = "admin@repairmanagement.local",
            Password = "AdminPassword123!"
        }, "127.0.0.1", "xunit");

        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result!.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(result.RefreshToken));
        Assert.Equal(user.Email, result.User.Email);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_IncrementsFailedAttempts()
    {
        await using var db = CreateDbContext();
        var service = CreateAuthService(db);

        var user = CreateUser("tech@repairmanagement.local", "TechPassword123!", Role.Technician);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var result = await service.LoginAsync(new LoginRequestDto
        {
            Email = "tech@repairmanagement.local",
            Password = "WrongPassword123!"
        }, "127.0.0.1", "xunit");

        var updatedUser = await db.Users.FirstAsync(u => u.Id == user.Id);

        Assert.Null(result);
        Assert.Equal(1, updatedUser.FailedLoginAttempts);
    }

    [Fact]
    public async Task LoginAsync_AfterFiveFailedAttempts_LocksUser()
    {
        await using var db = CreateDbContext();
        var service = CreateAuthService(db);

        var user = CreateUser("lock@repairmanagement.local", "LockPassword123!", Role.Technician);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        for (var i = 0; i < 5; i++)
        {
            await service.LoginAsync(new LoginRequestDto
            {
                Email = "lock@repairmanagement.local",
                Password = "WrongPassword123!"
            }, "127.0.0.1", "xunit");
        }

        var updatedUser = await db.Users.FirstAsync(u => u.Id == user.Id);

        Assert.NotNull(updatedUser.LockoutEndUtc);
        Assert.True(updatedUser.LockoutEndUtc > DateTime.UtcNow);
        Assert.Equal(0, updatedUser.FailedLoginAttempts);
    }

    [Fact]
    public async Task RefreshAsync_RotatesToken_AndRejectsOldTokenReuse()
    {
        await using var db = CreateDbContext();
        var service = CreateAuthService(db);

        var user = CreateUser("rotate@repairmanagement.local", "RotatePassword123!", Role.Admin);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var loginResult = await service.LoginAsync(new LoginRequestDto
        {
            Email = "rotate@repairmanagement.local",
            Password = "RotatePassword123!"
        }, "127.0.0.1", "xunit");

        Assert.NotNull(loginResult);

        var firstRefresh = await service.RefreshAsync(new RefreshTokenRequestDto
        {
            RefreshToken = loginResult!.RefreshToken
        }, "127.0.0.1", "xunit");

        Assert.NotNull(firstRefresh);
        Assert.NotEqual(loginResult.RefreshToken, firstRefresh!.RefreshToken);

        var reuseOldToken = await service.RefreshAsync(new RefreshTokenRequestDto
        {
            RefreshToken = loginResult.RefreshToken
        }, "127.0.0.1", "xunit");

        Assert.Null(reuseOldToken);
    }

    private static AuthService CreateAuthService(AppDbContext db)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "super-secret-test-key-1234567890",
                ["Jwt:Issuer"] = "repair-management-tests",
                ["Jwt:Audience"] = "repair-management-tests"
            })
            .Build();

        var hasher = new PasswordHasher();
        var jwtService = new JwtTokenService(config);
        var refreshService = new RefreshTokenService();

        return new AuthService(db, hasher, jwtService, refreshService);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static User CreateUser(string email, string rawPassword, Role role)
    {
        var hasher = new PasswordHasher();

        return new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test User",
            Email = email,
            PasswordHash = hasher.Hash(rawPassword),
            Role = role,
            IsActive = true,
            FailedLoginAttempts = 0,
            LockoutEndUtc = null,
            MustChangePassword = false,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
    }
}
