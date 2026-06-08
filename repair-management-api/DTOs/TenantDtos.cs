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
}

public class UpdateTenantRequestDto
{
    [Required]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "Company name must be between 2 and 150 characters.")]
    public string CompanyName { get; set; } = string.Empty;
}
