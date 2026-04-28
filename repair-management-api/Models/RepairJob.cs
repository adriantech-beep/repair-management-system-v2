using RepairManagementApi.Enums;

namespace RepairManagementApi.Models;

public class RepairJob
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid DeviceId { get; set; }
    public Device? Device { get; set; }
    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }
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