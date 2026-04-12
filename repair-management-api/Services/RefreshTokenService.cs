using System.Security.Cryptography;
using RepairManagementApi.Models;

namespace RepairManagementApi.Services;

public interface IRefreshTokenService
{
    string GenerateRawToken();
    string HashToken(string rawToken);
    RefreshToken CreateRefreshToken(Guid userId, string rawToken, string? ipAddress, string? deviceInfo);
}

public class RefreshTokenService : IRefreshTokenService
{
    public string GenerateRawToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public string HashToken(string rawToken)
    {
        var bytes = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToBase64String(bytes);
    }

    public RefreshToken CreateRefreshToken(Guid userId, string rawToken, string? ipAddress, string? deviceInfo)
    {
        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = HashToken(rawToken),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7),
            CreatedAtUtc = DateTime.UtcNow,
            IpAddress = ipAddress,
            DeviceInfo = deviceInfo
        };
    }
}