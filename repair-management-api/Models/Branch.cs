namespace RepairManagementApi.Models;

public class Branch
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Address { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<User> Users { get; set; } = [];

    public List<Customer> Customers { get; set; } = [];

    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
}
