using System;
using System.ComponentModel.DataAnnotations;

namespace RepairManagementApi.DTOs;

public class AllocatePartRequestDto
{
    [Required]
    public Guid PartId { get; set; }

    [Required]
    [Range(1, 100, ErrorMessage = "Allocation quantity must be between 1 and 100 units.")]
    public int Quantity { get; set; } = 1;
}

public class RepairJobPartResponseDto
{
    public Guid Id { get; set; }
    public Guid PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string PartNumber { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => UnitPrice * Quantity;
    public DateTime AllocatedAtUtc { get; set; }
}
