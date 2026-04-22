using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;
using RepairManagementApi.Models;
using RepairManagementApi.Services;

namespace repair_management_api.Tests;

public class InventoryWaitlistServiceTests
{
    [Fact]
    public async Task CreateWaitlistRequestAsync_WithDuplicateActiveRequest_ThrowsDuplicateError()
    {
        await using var db = CreateDbContext();

        var part = CreatePart(stockQuantity: 0);
        db.Parts.Add(part);
        db.PartWaitlistRequests.Add(new PartWaitlistRequest
        {
            Id = Guid.NewGuid(),
            PartId = part.Id,
            CustomerName = "Existing Customer",
            CustomerEmail = "dup@example.com",
            CustomerPhone = null,
            PreferredContactMethod = PreferredContactMethod.Email,
            Status = WaitlistStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = new WaitlistService(db);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateWaitlistRequestAsync(part.Id, new CreateWaitlistRequestDto
            {
                CustomerName = "New Customer",
                CustomerEmail = "dup@example.com",
                CustomerPhone = null,
                PreferredContactMethod = PreferredContactMethod.Email,
                Notes = "Duplicate test"
            }));

        Assert.Equal("DUPLICATE_WAITLIST_REQUEST", ex.Message);
    }

    [Fact]
    public async Task CreateWaitlistRequestAsync_WithoutAnyContact_ThrowsContactRequired()
    {
        await using var db = CreateDbContext();

        var part = CreatePart(stockQuantity: 0);
        db.Parts.Add(part);
        await db.SaveChangesAsync();

        var service = new WaitlistService(db);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateWaitlistRequestAsync(part.Id, new CreateWaitlistRequestDto
            {
                CustomerName = "No Contact Customer",
                CustomerEmail = null,
                CustomerPhone = null,
                PreferredContactMethod = PreferredContactMethod.Email
            }));

        Assert.Equal("CONTACT_REQUIRED", ex.Message);
    }

    [Fact]
    public async Task UpdateStockAsync_WhenStockTransitionsFromZeroToPositive_MarksPendingWaitlistAsNotified()
    {
        await using var db = CreateDbContext();

        var part = CreatePart(stockQuantity: 0);
        db.Parts.Add(part);

        var pendingWaitlist = new PartWaitlistRequest
        {
            Id = Guid.NewGuid(),
            PartId = part.Id,
            CustomerName = "Juan Dela Cruz",
            CustomerEmail = "juan@example.com",
            CustomerPhone = null,
            PreferredContactMethod = PreferredContactMethod.Email,
            Status = WaitlistStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };

        db.PartWaitlistRequests.Add(pendingWaitlist);
        await db.SaveChangesAsync();

        var notificationService = new FakeNotificationService();
        var inventoryService = new InventoryService(db, notificationService);

        var result = await inventoryService.UpdateStockAsync(part.Id, new UpdateStockRequestDto
        {
            NewQuantity = 5,
            Reason = "Restock test"
        });

        Assert.NotNull(result);
        Assert.Equal(5, result!.StockQuantity);

        var updatedWaitlist = await db.PartWaitlistRequests.FirstAsync(w => w.Id == pendingWaitlist.Id);
        Assert.Equal(WaitlistStatus.Notified, updatedWaitlist.Status);
        Assert.NotNull(updatedWaitlist.NotifiedAtUtc);
        Assert.Equal(1, notificationService.CallCount);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static Part CreatePart(int stockQuantity)
    {
        return new Part
        {
            Id = Guid.NewGuid(),
            PartNumber = $"PRT-{Guid.NewGuid():N}"[..16],
            Name = "Charging Port Flex",
            Category = "Charging Port",
            StockQuantity = stockQuantity,
            SupplierPrice = 120.00m,
            SellingPrice = 250.00m,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
    }

    private sealed class FakeNotificationService : INotificationService
    {
        public int CallCount { get; private set; }

        public Task NotifyPartAvailableAsync(Part part, PartWaitlistRequest waitlistRequest)
        {
            CallCount++;
            return Task.CompletedTask;
        }
    }
}
