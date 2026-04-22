using RepairManagementApi.Models;
using RepairManagementApi.Enums;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using Microsoft.EntityFrameworkCore;


namespace RepairManagementApi.Services;

public interface IInventoryService
{
    Task<PartResponseDto> CreatePartAsync(CreatePartRequestDto request);
    Task<PartResponseDto?> GetPartByIdAsync(Guid partId);
    Task<List<PartResponseDto>> GetPartsAsync(string? search, string? category, bool inStockOnly);
    Task<PartResponseDto?> UpdatePartAsync(Guid partId, UpdatePartRequestDto request);
    Task<CompatibilityResponseDto?> AddCompatibilityAsync(Guid partId, AddCompatibilityRequestDto request);
    Task<bool> RemoveCompatibilityAsync(Guid partId, Guid compatibilityId);
    Task<PartResponseDto?> UpdateStockAsync(Guid partId, UpdateStockRequestDto request);

    
}



public class InventoryService : IInventoryService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notificationService;

    public InventoryService(AppDbContext db, INotificationService notificationService)
    {
    _db = db;
    _notificationService = notificationService;
    }

    private static PartResponseDto MapToDto(Part part) => new()
    {
        Id = part.Id,
        PartNumber = part.PartNumber,
        Name = part.Name,
        Category = part.Category,
        StockQuantity = part.StockQuantity,
        SupplierPrice = part.SupplierPrice,
        SellingPrice = part.SellingPrice,
        IsActive = part.IsActive,
        Compatibilities = part.Compatibilities.Select(c => new CompatibilityResponseDto
    {
        Id = c.Id,
        Brand = c.Brand,
        ModelName = c.ModelName
    }).ToList()
};

    public async Task<PartResponseDto> CreatePartAsync(CreatePartRequestDto request)
    {
        var normalizedPartNumber = request.PartNumber.Trim();

        var partNumberExists = await _db.Parts
        .AnyAsync(p => p.PartNumber == normalizedPartNumber);

        if (partNumberExists)
        {
        throw new InvalidOperationException("DUPLICATE_PART_NUMBER");
        }
        
        var part = new Part
        {
            Id = Guid.NewGuid(),
            PartNumber = normalizedPartNumber,
            Name = request.Name,
            Category = request.Category,
            StockQuantity = request.StockQuantity,
            SupplierPrice = request.SupplierPrice,
            SellingPrice = request.SellingPrice,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
            Compatibilities = new List<PartCompatibility>(),
            WaitlistRequests = new List<PartWaitlistRequest>()       

        };
            
      
        


        _db.Parts.Add(part);
        await _db.SaveChangesAsync();

        return MapToDto(part);
    }

    public async Task<PartResponseDto?> GetPartByIdAsync(Guid partId)
    {
        var part = await _db.Parts
            .Include(p => p.Compatibilities)
            .FirstOrDefaultAsync(p => p.Id == partId);

        if (part is null)
            return null;

        return MapToDto(part);
    }

    public async Task<List<PartResponseDto>> GetPartsAsync(string? search, string? category, bool inStockOnly)
    {
        var query = _db.Parts
            .Include(p => p.Compatibilities)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            var lowerSearch = search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(lowerSearch) ||
                p.PartNumber.ToLower().Contains(lowerSearch));
        }

        if (!string.IsNullOrEmpty(category))
        {
            var lowerCategory = category.ToLower();
            query = query.Where(p => p.Category.ToLower() == lowerCategory);
        }

        if (inStockOnly)
        {
            query = query.Where(p => p.StockQuantity > 0);
        }

        var parts = await query.ToListAsync();
        return parts.Select(MapToDto).ToList();
    }


    public async Task<PartResponseDto?> UpdatePartAsync(Guid partId, UpdatePartRequestDto request)
    {
        var normalizedPartNumber = request.PartNumber.Trim();

        var duplicatePartNumber = await _db.Parts
        .AnyAsync(p => p.Id != partId && p.PartNumber == normalizedPartNumber);

        if (duplicatePartNumber)
        {
        throw new InvalidOperationException("DUPLICATE_PART_NUMBER");
        }
        
        var part = await _db.Parts
            .Include(p => p.Compatibilities)
            .FirstOrDefaultAsync(p => p.Id == partId);

        if (part is null)
            return null;

        part.PartNumber = normalizedPartNumber;
        part.Name = request.Name;
        part.Category = request.Category;
        part.StockQuantity = request.StockQuantity;
        part.SupplierPrice = request.SupplierPrice;
        part.SellingPrice = request.SellingPrice;
        part.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToDto(part);
    }


    public async Task<CompatibilityResponseDto?> AddCompatibilityAsync(Guid partId, AddCompatibilityRequestDto request)
    {
        var part = await _db.Parts
            .Include(p => p.Compatibilities)
            .FirstOrDefaultAsync(p => p.Id == partId);

        if (part is null)
            return null;

        var normalizedBrand = request.Brand.Trim();
        var normalizedModel = request.ModelName.Trim();

        var duplicateCompatibility = await _db.PartCompatibilities
        .AnyAsync(c =>
        c.PartId == partId &&
        c.Brand == normalizedBrand &&
        c.ModelName == normalizedModel);

        if (duplicateCompatibility)
        {
        throw new InvalidOperationException("DUPLICATE_COMPATIBILITY");
        }

        var compatibility = new PartCompatibility
        {
            Id = Guid.NewGuid(),
            PartId = partId,
            Brand = normalizedBrand,
            ModelName = normalizedModel
        };

        part.Compatibilities.Add(compatibility);
        await _db.SaveChangesAsync();

        return new CompatibilityResponseDto
        {
            Id = compatibility.Id,
            Brand = compatibility.Brand,
            ModelName = compatibility.ModelName
        };
    }


    public async Task<bool> RemoveCompatibilityAsync(Guid partId, Guid compatibilityId)
    {
        var part = await _db.Parts
            .Include(p => p.Compatibilities)
            .FirstOrDefaultAsync(p => p.Id == partId);

        if (part is null)
            return false;

        var compatibility = part.Compatibilities.FirstOrDefault(c => c.Id == compatibilityId);
        if (compatibility is null)
            return false;

        part.Compatibilities.Remove(compatibility);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<PartResponseDto?> UpdateStockAsync(Guid partId, UpdateStockRequestDto request)
    {
        var part = await _db.Parts
        .Include(p => p.Compatibilities)
        .FirstOrDefaultAsync(p => p.Id == partId);

        if (part is null)
        return null;

        var wasOutOfStock = part.StockQuantity == 0;

        part.StockQuantity = request.NewQuantity;
        part.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        if (wasOutOfStock && part.StockQuantity > 0)
    {
        var pendingWaitlistRequests = await _db.PartWaitlistRequests
        .Where(w => w.PartId == partId && w.Status == WaitlistStatus.Pending)
        .ToListAsync();

        foreach (var waitlistRequest in pendingWaitlistRequests)
    {
        await _notificationService.NotifyPartAvailableAsync(part, waitlistRequest);

        waitlistRequest.Status = WaitlistStatus.Notified;
        waitlistRequest.NotifiedAtUtc = DateTime.UtcNow;
    }

    if (pendingWaitlistRequests.Count > 0)
    {
        await _db.SaveChangesAsync();
    }
    
}

    return MapToDto(part);
}

}

