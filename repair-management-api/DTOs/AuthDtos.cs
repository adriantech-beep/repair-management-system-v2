using System.ComponentModel.DataAnnotations;

namespace RepairManagementApi.DTOs;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(10)]
    public string Password { get; set; } = string.Empty;
}

public class AuthUserDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int AccessTokenExpiresInSeconds { get; set; } = 900;
    public DateTime RefreshTokenExpiresAt { get; set; }
    public AuthUserDto User { get; set; } = new();
}

public class RefreshTokenRequestDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class CreateUserRequestDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Admin|Technician|admin|technician)$")]
    public string Role { get; set; } = string.Empty;
}
