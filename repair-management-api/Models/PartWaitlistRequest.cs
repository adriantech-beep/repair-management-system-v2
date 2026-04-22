using RepairManagementApi.Enums;

namespace RepairManagementApi.Models;

public class PartWaitlistRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PartId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string? CustomerEmail { get; set; }

    public string? CustomerPhone { get; set; }

    public PreferredContactMethod PreferredContactMethod { get; set; } = PreferredContactMethod.Email;

    public WaitlistStatus Status { get; set; } = WaitlistStatus.Pending;

    public string? Notes { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? NotifiedAtUtc { get; set; }

    public DateTime? ResolvedAtUtc { get; set; }

    public Part Part { get; set; } = null!;
}