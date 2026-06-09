using System;
using System.ComponentModel.DataAnnotations;

namespace RepairManagementApi.DTOs;

public class TenantDto
{
    public Guid Id { get; set; }
    
    public string CompanyName { get; set; } = string.Empty;
    
    public string Subdomain { get; set; } = string.Empty;
    
    public string? LogoUrl { get; set; }
    
    public string SubscriptionStatus { get; set; } = string.Empty;
    
    public DateTime CreatedAtUtc { get; set; }

    public string? ContactNumber { get; set; }
    public string? Website { get; set; }
    public string? BusinessNumber { get; set; }
}

public class UpdateTenantRequestDto
{
    [Required]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "Company name must be between 2 and 150 characters.")]
    public string CompanyName { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "Contact number must be less than 50 characters.")]
    public string? ContactNumber { get; set; }

    [StringLength(150, ErrorMessage = "Website must be less than 150 characters.")]
    public string? Website { get; set; }

    [StringLength(100, ErrorMessage = "Business number must be less than 100 characters.")]
    public string? BusinessNumber { get; set; }
}

public class PublicTenantDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? ContactNumber { get; set; }
    public string? Website { get; set; }
    public string? BusinessNumber { get; set; }
}

