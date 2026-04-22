using System.ComponentModel.DataAnnotations;
using RepairManagementApi.Enums;
namespace RepairManagementApi.DTOs;

public class CreatePartRequestDto
{
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string PartNumber { get; set; } = string.Empty;

    [Required]    [StringLength(120, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]    [StringLength(60, MinimumLength = 2)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal SupplierPrice { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal SellingPrice { get; set; }
}


public class UpdatePartRequestDto
{
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string PartNumber { get; set; } = string.Empty;

    [Required]    [StringLength(120, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]    [StringLength(60, MinimumLength = 2)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal SupplierPrice { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal SellingPrice { get; set; }
}


public class AddCompatibilityRequestDto
{
    [Required, StringLength(60, MinimumLength = 2)]
    public string Brand { get; set; } = string.Empty;

    [Required, StringLength(80, MinimumLength = 1)]
    public string ModelName { get; set; } = string.Empty;
}

public class UpdateStockRequestDto
{
    [Required]
    [Range(0, int.MaxValue)]
    public int NewQuantity { get; set; }
    public string? Reason { get; set; }
}

public class CreateWaitlistRequestDto
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string CustomerName { get; set; } = string.Empty;

    [ EmailAddress]
    public string? CustomerEmail { get; set; } = string.Empty;

    [StringLength(20)]
    public string? CustomerPhone { get; set; }

    [Required]
    public PreferredContactMethod PreferredContactMethod { get; set; } = PreferredContactMethod.Email;

    public string? Notes { get; set; }
}

public class UpdateWaitlistStatusRequestDto
{
    [Required]
    public WaitlistStatus Status { get; set; } = WaitlistStatus.Pending;
}

public class CompatibilityResponseDto
{
    public Guid Id { get; set; } 
    public string Brand { get; set; } = string.Empty;
    public string ModelName { get; set; } = string.Empty;
}

public class PartResponseDto
{
    public Guid Id { get; set; }
    public string PartNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public decimal SupplierPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public bool IsActive { get; set; }
    public List<CompatibilityResponseDto> Compatibilities { get; set; } = new();
}


public class WaitlistResponseDto
{
    public Guid Id { get; set; }
    public Guid PartId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public PreferredContactMethod PreferredContactMethod { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? NotifiedAtUtc { get; set; }
    public DateTime? ResolvedAtUtc { get; set; }    
    public string? Notes { get; set; }
}