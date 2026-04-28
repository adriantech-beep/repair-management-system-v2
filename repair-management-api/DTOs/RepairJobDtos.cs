using System.ComponentModel.DataAnnotations;
using RepairManagementApi.Enums;

namespace RepairManagementApi.DTOs;

public class CreateRepairJobRequestDto
{
    [Required]
    public Guid CustomerId { get; set; }

    [Required]
    public Guid DeviceId { get; set; }

    [Required]
    public Guid BranchId { get; set; }

    [Required]
    [StringLength(1000, MinimumLength = 5)]
    public string ProblemDescription { get; set; } = string.Empty;

    [Range(0, 999999.99)]
    public decimal? EstimatedCost { get; set; }
}

public class UpdateRepairJobRequestDto
{
    [Required]
    [StringLength(1000, MinimumLength = 5)]
    public string ProblemDescription { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? DiagnosisNotes { get; set; }

    [StringLength(1000)]
    public string? ResolutionNotes { get; set; }

    [Range(0, 999999.99)]
    public decimal? EstimatedCost { get; set; }

    [Range(0, 999999.99)]
    public decimal? FinalCost { get; set; }
}

public class UpdateRepairJobStatusRequestDto
{
    [Required]
    public RepairJobStatus Status { get; set; }
}

public class RepairJobResponseDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid DeviceId { get; set; }
    public Guid BranchId { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public string ProblemDescription { get; set; } = string.Empty;
    public string? DiagnosisNotes { get; set; }
    public string? ResolutionNotes { get; set; }
    public decimal? EstimatedCost { get; set; }
    public decimal? FinalCost { get; set; }
    public RepairJobStatus Status { get; set; }
    public DateTime ReceivedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public class RepairJobListItemDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid DeviceId { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public string ProblemDescription { get; set; } = string.Empty;
    public RepairJobStatus Status { get; set; }
    public decimal? EstimatedCost { get; set; }
    public DateTime ReceivedAtUtc { get; set; }
}