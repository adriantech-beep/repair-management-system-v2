using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using RepairManagementApi.Controllers;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Models;
using RepairManagementApi.Services;
using Xunit;

namespace repair_management_api.Tests;

public class RepairJobPartsTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task AllocatePart_WithValidData_DecrementsStock_AndUpdatesCost()
    {
        // 1. Arrange
        await using var db = CreateDbContext();
        var service = new RepairJobPartService(db);
        var controller = new RepairJobPartsController(service);

        var tenantId = Guid.NewGuid();
        var job = new RepairJob
        {
            Id = Guid.NewGuid(),
            JobNumber = "JOB-100",
            ProblemDescription = "Screen cracked",
            EstimatedCost = 150m,
            FinalCost = 0m,
            TenantId = tenantId
        };

        var part = new Part
        {
            Id = Guid.NewGuid(),
            PartNumber = "PART-SCRN",
            Name = "LCD Screen",
            Category = "Screens",
            StockQuantity = 10,
            SupplierPrice = 30m,
            SellingPrice = 80m,
            IsActive = true
        };

        db.RepairJobs.Add(job);
        db.Parts.Add(part);
        await db.SaveChangesAsync();

        // 2. Act
        var request = new AllocatePartRequestDto { PartId = part.Id, Quantity = 2 };
        var result = await controller.AllocatePart(job.Id, request);

        // 3. Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<RepairJobPartResponseDto>(okResult.Value);

        var updatedPart = await db.Parts.FirstAsync(p => p.Id == part.Id);
        var updatedJob = await db.RepairJobs.FirstAsync(rj => rj.Id == job.Id);

        Assert.Equal(8, updatedPart.StockQuantity); // 10 - 2 = 8
        Assert.Equal(160m, updatedJob.FinalCost); // 80 * 2 = 160
        Assert.Equal(2, response.Quantity);
        Assert.Equal(80m, response.UnitPrice);
    }

    [Fact]
    public async Task AllocatePart_WithInsufficientStock_ReturnsBadRequest()
    {
        // 1. Arrange
        await using var db = CreateDbContext();
        var service = new RepairJobPartService(db);
        var controller = new RepairJobPartsController(service);

        var job = new RepairJob
        {
            Id = Guid.NewGuid(),
            JobNumber = "JOB-200",
            ProblemDescription = "Battery replacement",
            TenantId = Guid.NewGuid()
        };

        var part = new Part
        {
            Id = Guid.NewGuid(),
            PartNumber = "PART-BATT",
            Name = "Li-ion Battery",
            Category = "Batteries",
            StockQuantity = 1, // Only 1 in stock!
            SellingPrice = 40m,
            IsActive = true
        };

        db.RepairJobs.Add(job);
        db.Parts.Add(part);
        await db.SaveChangesAsync();

        // 2. Act: Try to request 2 batteries (insufficient stock)
        var request = new AllocatePartRequestDto { PartId = part.Id, Quantity = 2 };
        var result = await controller.AllocatePart(job.Id, request);

        // 3. Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.NotNull(badRequest.Value);
    }

    [Fact]
    public async Task RemovePart_RestoresStock_AndDeductsCost()
    {
        // 1. Arrange
        await using var db = CreateDbContext();
        var service = new RepairJobPartService(db);
        var controller = new RepairJobPartsController(service);

        var tenantId = Guid.NewGuid();
        var job = new RepairJob
        {
            Id = Guid.NewGuid(),
            JobNumber = "JOB-300",
            ProblemDescription = "Charge port issue",
            FinalCost = 50m, // Pre-configured cost of the port
            TenantId = tenantId
        };

        var part = new Part
        {
            Id = Guid.NewGuid(),
            PartNumber = "PART-PORT",
            Name = "Charging Port",
            Category = "Ports",
            StockQuantity = 5, // Decremented to 5 after allocation
            SellingPrice = 50m,
            IsActive = true
        };

        var allocation = new RepairJobPart
        {
            Id = Guid.NewGuid(),
            RepairJobId = job.Id,
            PartId = part.Id,
            Quantity = 1,
            UnitPrice = 50m,
            TenantId = tenantId
        };

        db.RepairJobs.Add(job);
        db.Parts.Add(part);
        db.RepairJobParts.Add(allocation);
        await db.SaveChangesAsync();

        // 2. Act
        var result = await controller.RemovePart(job.Id, allocation.Id);

        // 3. Assert
        Assert.IsType<NoContentResult>(result);

        var updatedPart = await db.Parts.FirstAsync(p => p.Id == part.Id);
        var updatedJob = await db.RepairJobs.FirstAsync(rj => rj.Id == job.Id);

        Assert.Equal(6, updatedPart.StockQuantity); // 5 + 1 = 6 restored
        Assert.Equal(0m, updatedJob.FinalCost); // 50 - (50*1) = 0
    }
}
