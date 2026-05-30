using System;

namespace RepairManagementApi.Services;

public interface ITenantContext
{
    Guid? TenantId { get; }
    string? Subdomain { get; }
}

public class TenantContext : ITenantContext
{
    public Guid? TenantId { get; set; }
    public string? Subdomain { get; set; }
}
