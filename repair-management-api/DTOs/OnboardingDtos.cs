using System.ComponentModel.DataAnnotations;

namespace RepairManagementApi.DTOs;

public class OnboardingSignupRequestDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$", 
        ErrorMessage = "Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^[a-z0-9\-]+$", ErrorMessage = "Subdomain can only contain lowercase letters, numbers, and hyphens.")]
    [StringLength(100, MinimumLength = 3)]
    public string Subdomain { get; set; } = string.Empty;
}

public class OnboardingSignupResponseDto
{
    public string CheckoutUrl { get; set; } = string.Empty;
}
