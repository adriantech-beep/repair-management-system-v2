using System.ComponentModel.DataAnnotations;
using RepairManagementApi.Enums;

namespace RepairManagementApi.DTOs;

public class CreateDeviceRequestDto
{
    [Required]
    public Guid CustomerId { get; set; }

    [Required]
    public Guid BranchId { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Model { get; set; } = string.Empty;

    [StringLength(100)]
    public string? SerialNumber { get; set; }

    [Required]
    public DeviceType DeviceType { get; set; }
}

public class UpdateDeviceRequestDto
{
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Model { get; set; } = string.Empty;

    [StringLength(100)]
    public string? SerialNumber { get; set; }

    [Required]
    public DeviceType DeviceType { get; set; }
}

public class DeviceResponseDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid BranchId { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public DeviceType DeviceType { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public class DeviceListItemDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public DeviceType DeviceType { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}