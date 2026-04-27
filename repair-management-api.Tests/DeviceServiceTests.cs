using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;
using RepairManagementApi.Models;
using RepairManagementApi.Services;

namespace RepairManagementApi.Tests;

public class DeviceServiceTests
{
    // --- Arrange: CreateDevice Happy Path ---
    [Fact]
    public async Task CreateDeviceAsync_WithValidData_CreatesDevice()
    {
        await using var db = CreateDbContext();
        var (branch, customer) = await CreateBranchAndCustomer(db);
        var service = new DeviceService(db);

        var result = await service.CreateDeviceAsync(new CreateDeviceRequestDto
        {
            CustomerId = customer.Id,
            BranchId = branch.Id,
            Brand = "Apple",
            Model = "iPhone 14",
            SerialNumber = "SN-001",
            DeviceType = DeviceType.Mobile
        });

        Assert.Equal("Apple", result.Brand);
        Assert.Equal("iPhone 14", result.Model);
        Assert.Equal(DeviceType.Mobile, result.DeviceType);
    }

    // --- Arrange: CreateDevice - Branch Not Found ---
    [Fact]
    public async Task CreateDeviceAsync_NonExistentBranch_ThrowsInvalidOperationException()
    {
        await using var db = CreateDbContext();
        var (_, customer) = await CreateBranchAndCustomer(db);
        var service = new DeviceService(db);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateDeviceAsync(new CreateDeviceRequestDto
            {
                CustomerId = customer.Id,
                BranchId = Guid.NewGuid(),
                Brand = "Samsung",
                Model = "Galaxy S22",
                DeviceType = DeviceType.Mobile
            }));

        Assert.Equal("Branch_Not_Found.", ex.Message);
    }

    // --- Arrange: CreateDevice - Customer Not Found ---
    [Fact]
    public async Task CreateDeviceAsync_NonExistentCustomer_ThrowsInvalidOperationException()
    {
        await using var db = CreateDbContext();
        var (branch, _) = await CreateBranchAndCustomer(db);
        var service = new DeviceService(db);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateDeviceAsync(new CreateDeviceRequestDto
            {
                CustomerId = Guid.NewGuid(),
                BranchId = branch.Id,
                Brand = "Samsung",
                Model = "Galaxy S22",
                DeviceType = DeviceType.Mobile
            }));

        Assert.Equal("Customer_Not_Found.", ex.Message);
    }

    // --- Arrange: CreateDevice - Customer Belongs To Different Branch ---
    [Fact]
    public async Task CreateDeviceAsync_CustomerNotInBranch_ThrowsInvalidOperationException()
    {
        await using var db = CreateDbContext();
        var (_, customer) = await CreateBranchAndCustomer(db);

        // Create a second branch
        var otherBranch = CreateBranch();
        db.Branches.Add(otherBranch);
        await db.SaveChangesAsync();

        var service = new DeviceService(db);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateDeviceAsync(new CreateDeviceRequestDto
            {
                CustomerId = customer.Id,
                BranchId = otherBranch.Id,
                Brand = "Apple",
                Model = "iPhone 14",
                DeviceType = DeviceType.Mobile
            }));

        Assert.Equal("Customer_Not_Assigned_To_Branch.", ex.Message);
    }

    // --- Arrange: GetDeviceById - Found ---
    [Fact]
    public async Task GetDeviceByIdAsync_ExistingDevice_ReturnsDevice()
    {
        await using var db = CreateDbContext();
        var (branch, customer) = await CreateBranchAndCustomer(db);
        var device = CreateDevice(customer.Id, branch.Id);
        db.Devices.Add(device);
        await db.SaveChangesAsync();

        var service = new DeviceService(db);
        var result = await service.GetDeviceByIdAsync(device.Id);

        Assert.NotNull(result);
        Assert.Equal(device.Id, result.Id);
    }

    // --- Arrange: GetDeviceById - Not Found ---
    [Fact]
    public async Task GetDeviceByIdAsync_NonExistentDevice_ReturnsNull()
    {
        await using var db = CreateDbContext();
        var service = new DeviceService(db);

        var result = await service.GetDeviceByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    // --- Arrange: GetDevicesByCustomerId - Returns Correct Devices ---
    [Fact]
    public async Task GetDevicesByCustomerIdAsync_WithMultipleDevices_ReturnsAllForCustomer()
    {
        await using var db = CreateDbContext();
        var (branch, customer) = await CreateBranchAndCustomer(db);

        db.Devices.Add(CreateDevice(customer.Id, branch.Id, "Apple"));
        db.Devices.Add(CreateDevice(customer.Id, branch.Id, "Samsung"));
        await db.SaveChangesAsync();

        var service = new DeviceService(db);
        var results = await service.GetDevicesByCustomerIdAsync(customer.Id);

        Assert.Equal(2, results.Count);
    }

    // --- Arrange: UpdateDevice - Happy Path ---
    [Fact]
    public async Task UpdateDeviceAsync_ExistingDevice_UpdatesDevice()
    {
        await using var db = CreateDbContext();
        var (branch, customer) = await CreateBranchAndCustomer(db);
        var device = CreateDevice(customer.Id, branch.Id, "Apple");
        db.Devices.Add(device);
        await db.SaveChangesAsync();

        var service = new DeviceService(db);
        var result = await service.UpdateDeviceAsync(device.Id, new UpdateDeviceRequestDto
        {
            Brand = "Samsung",
            Model = "Galaxy S23",
            DeviceType = DeviceType.Mobile
        });

        Assert.Equal("Samsung", result.Brand);
        Assert.Equal("Galaxy S23", result.Model);
    }

    // --- Arrange: DeleteDevice - Happy Path ---
    [Fact]
    public async Task DeleteDeviceAsync_ExistingDevice_RemovesDevice()
    {
        await using var db = CreateDbContext();
        var (branch, customer) = await CreateBranchAndCustomer(db);
        var device = CreateDevice(customer.Id, branch.Id);
        db.Devices.Add(device);
        await db.SaveChangesAsync();

        var service = new DeviceService(db);
        await service.DeleteDeviceAsync(device.Id);

        var deleted = await db.Devices.FindAsync(device.Id);
        Assert.Null(deleted);
    }

    // --- Helpers ---
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static Branch CreateBranch()
    {
        return new Branch
        {
            Id = Guid.NewGuid(),
            Code = Guid.NewGuid().ToString("N")[..8],
            Name = Guid.NewGuid().ToString("N")[..20],
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
    }

    private static async Task<(Branch, Customer)> CreateBranchAndCustomer(AppDbContext db)
    {
        var branch = CreateBranch();
        db.Branches.Add(branch);

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            FullName = "Test Customer",
            Phone = "555-0001",
            BranchId = branch.Id,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        return (branch, customer);
    }

    private static Device CreateDevice(Guid customerId, Guid branchId, string brand = "Apple")
    {
        return new Device
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            BranchId = branchId,
            Brand = brand,
            Model = "Test Model",
            DeviceType = DeviceType.Mobile,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
    }
}