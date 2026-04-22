namespace RepairManagementApi.Models;


public class PartCompatibility
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PartId { get; set; }

    public string Brand { get; set; } = string.Empty;

    public string ModelName { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

   public Part Part { get; set; } = null!;
}