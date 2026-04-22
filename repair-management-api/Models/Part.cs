namespace RepairManagementApi.Models;

public class Part
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string PartNumber { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public int StockQuantity { get; set; } = 0;

    public decimal SupplierPrice { get; set; } = 0m;

    public decimal SellingPrice { get; set; } = 0m;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<PartCompatibility> Compatibilities { get; set; } = [];

    public List<PartWaitlistRequest> WaitlistRequests { get; set; } = [];
}
