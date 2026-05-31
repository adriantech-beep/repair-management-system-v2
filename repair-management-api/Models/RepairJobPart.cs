using System;

namespace RepairManagementApi.Models;

public class RepairJobPart
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid RepairJobId { get; set; }
    public RepairJob? RepairJob { get; set; }

    public Guid PartId { get; set; }
    public Part? Part { get; set; }

    public int Quantity { get; set; } = 1;

    // Historical price at the moment of allocation to insulate billing audits from inventory changes
    public decimal UnitPrice { get; set; }

    // Multi-tenant logical isolation key
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public DateTime AllocatedAtUtc { get; set; } = DateTime.UtcNow;
}
