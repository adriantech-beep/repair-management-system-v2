using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.Models;
using RepairManagementApi.Services;
using Xunit;

namespace repair_management_api.Tests;

public class TestTenantContext : ITenantContext
{
    public Guid? TenantId { get; set; }
    public string? Subdomain { get; set; }
}

public class MultiTenancyTests
{
    [Fact]
    public async Task QueryFilters_ShouldIsolateTenantData()
    {
        // 1. Arrange: Seed data for two different tenants in a clean DB instance
        var tenantAId = Guid.NewGuid();
        var tenantBId = Guid.NewGuid();

        var dbName = Guid.NewGuid().ToString();
        var seedOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        
        using (var seedDb = new AppDbContext(seedOptions))
        {
            var branchA = new Branch
            {
                Id = Guid.NewGuid(),
                Code = "BR-A",
                Name = "Branch A",
                TenantId = tenantAId,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            var branchB = new Branch
            {
                Id = Guid.NewGuid(),
                Code = "BR-B",
                Name = "Branch B",
                TenantId = tenantBId,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            seedDb.Branches.AddRange(branchA, branchB);
            await seedDb.SaveChangesAsync();
        }

        // 2. Act & Assert: Query with Tenant A resolved
        var tenantContext = new TestTenantContext { TenantId = tenantAId };
        var queryOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        using (var db = new AppDbContext(queryOptions, tenantContext))
        {
            var branches = await db.Branches.ToListAsync();

            Assert.Single(branches);
            Assert.Equal("BR-A", branches[0].Code);
            Assert.Equal(tenantAId, branches[0].TenantId);
        }
    }

    [Fact]
    public async Task SaveChanges_ShouldAutoStampTenantId()
    {
        // Arrange
        var tenantAId = Guid.NewGuid();
        var tenantContext = new TestTenantContext { TenantId = tenantAId };

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        // Act
        using (var db = new AppDbContext(options, tenantContext))
        {
            var branch = new Branch
            {
                Id = Guid.NewGuid(),
                Code = "AUTO-STAMP",
                Name = "Auto Stamped Branch",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            db.Branches.Add(branch);
            await db.SaveChangesAsync();

            // Assert
            Assert.Equal(tenantAId, branch.TenantId);
        }
    }
}
