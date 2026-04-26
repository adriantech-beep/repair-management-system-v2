using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;
using RepairManagementApi.Models;
using RepairManagementApi.Services;


namespace RepairManagementApi.Tests;


public class ICustomerServiceTests
{
    [Fact]
    public async Task CreateCustomerAsync_WithValidData_CreatesCustomer()
    {
        await using var db = CreateDbContext();

        var branch = CreateBranch();
        db.Branches.Add(branch);
        await db.SaveChangesAsync();

        var service = new CustomerService(db);

        var result = await service.CreateCustomerAsync(new CreateCustomerRequestDto
        {
            FullName = "John Doe",
            Phone = "123-456-7890",
            Email = "john.doe@example.com",
            Address = "123 Main St",
            BranchId = branch.Id
        });

        Assert.NotNull(result);
        Assert.Equal("John Doe", result.FullName);
        Assert.Equal("123-456-7890", result.Phone);
        Assert.Equal("john.doe@example.com", result.Email);
        Assert.Equal("123 Main St", result.Address);
        Assert.Equal(branch.Id, result.BranchId);
    }

    [Fact]
    public async Task CreateCustomerAsync_DuplicatePhone_ThrowsInvalidOperationException()
    {
        await using var db = CreateDbContext();

        var branch = CreateBranch();
        db.Branches.Add(branch);
        await db.SaveChangesAsync();

        var existingCustomer = CreateCustomer(branch.Id, "555-0001");
        db.Customers.Add(existingCustomer);
        await db.SaveChangesAsync();

        var service = new CustomerService(db);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateCustomerAsync(new CreateCustomerRequestDto
            {
                FullName = "Jane Smith",
                Phone = "555-0001", // Duplicate phone
                Email = "jane.smith@example.com",
                Address = "456 Elm St",
                BranchId = branch.Id
            }));

        Assert.Equal("Duplicate_Phone_Number.", ex.Message);

            

    }

    [Fact]
    public async Task CreateCustomerAsync_NonExistentBranch_ThrowsInvalidOperationException()
    {
        await using var db = CreateDbContext();

        var service = new CustomerService(db);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateCustomerAsync(new CreateCustomerRequestDto
            {
                FullName = "Jane Doe",
                Phone = "987-654-3210",
                Email = "jane.doe@example.com",
                Address = "456 Elm St",
                BranchId = Guid.NewGuid() // Non-existent branch
            }));

        Assert.Equal("Branch_Not_Found.", ex.Message);
    }

    [Fact]
    public async Task GetCustomerByIdAsync_ExistingCustomer_ReturnsCustomer()
    {
        await using var db = CreateDbContext();

        var branch = CreateBranch();
        db.Branches.Add(branch);
        await db.SaveChangesAsync();

        var customer = CreateCustomer(branch.Id, "555-0002");
        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        var service = new CustomerService(db);

        var result = await service.GetCustomerByIdAsync(customer.Id);

        Assert.NotNull(result);
        Assert.Equal(customer.FullName, result.FullName);
        Assert.Equal(customer.Phone, result.Phone);
        Assert.Equal(customer.Email, result.Email);
        Assert.Equal(customer.Address, result.Address);
        Assert.Equal(customer.BranchId, result.BranchId);
    }

    [Fact]
    public async Task GetCustomerByIdAsync_NonExistentCustomer_ReturnsNull()
    {
        await using var db = CreateDbContext();
        var service = new CustomerService(db);
        var result = await service.GetCustomerByIdAsync(Guid.NewGuid()); // Non-existent customer

        Assert.Null(result);
    }

    [Fact]
    public async Task GetCustomersAsync_WithFilters_ReturnsMatchingCustomers()
    {
        await using var db = CreateDbContext();

        var branch = CreateBranch();
        db.Branches.Add(branch);
        await db.SaveChangesAsync();

        var customer1 = CreateCustomer(branch.Id, "555-0003");
        customer1.FullName = "Alice";
        db.Customers.Add(customer1);

        var customer2 = CreateCustomer(branch.Id, "555-0004");
        customer2.FullName = "Bob";
        db.Customers.Add(customer2);

        var customer3 = CreateCustomer(branch.Id, "555-0004");
        customer3.FullName = "Alex";
        db.Customers.Add(customer3);

        await db.SaveChangesAsync();

        var service = new CustomerService(db);

        var results = await service.GetCustomersAsync(branchId: branch.Id, search: "Al");

        Assert.Equal(2, results.Count);
        Assert.Contains(results, c => c.FullName == "Alice");
        Assert.Contains(results, c => c.FullName == "Alex");
    }
    
    [Fact]
    public async Task UpdateCustomerAsync_ExistingCustomer_UpdatesCustomer()
    {
        await using var db = CreateDbContext();

        var branch = CreateBranch();
        db.Branches.Add(branch);
        await db.SaveChangesAsync();

        var customer = CreateCustomer(branch.Id, "555-0001");
        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        var service = new CustomerService(db);

        var result = await service.UpdateCustomerAsync(customer.Id, new UpdateCustomerRequestDto
        {
            FullName = "Updated Name",
            Phone = "555-0002",
            Email = "updated@example.com",
            Address = "789 Updated St",
            BranchId = branch.Id
        });

        Assert.NotNull(result);
        Assert.Equal("Updated Name", result.FullName);
        Assert.Equal("555-0002", result.Phone);
        Assert.Equal("updated@example.com", result.Email);
        Assert.Equal("789 Updated St", result.Address);
        Assert.Equal(branch.Id, result.BranchId);
    }

    [Fact]
    public async Task UpdateCustomerAsync_DuplicatePhone_ThrowsInvalidOperationException()
    {
        await using var db = CreateDbContext();

        var branch = CreateBranch();
        db.Branches.Add(branch);
        await db.SaveChangesAsync();

        var customer1 = CreateCustomer(branch.Id, "555-0001");
        db.Customers.Add(customer1);

        var customer2 = CreateCustomer(branch.Id, "555-0002");
        db.Customers.Add(customer2);

        await db.SaveChangesAsync();

        var service = new CustomerService(db);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpdateCustomerAsync(customer2.Id, new UpdateCustomerRequestDto
            {
                FullName = "Updated Name",
                Phone = "555-0001", // Duplicate phone
                Email = "updated@example.com",
                Address = "789 Updated St",
                BranchId = branch.Id
            }));
            
        Assert.Equal("Duplicate_Phone_Number.", ex.Message);
    }


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
        Code = $"BR-{Guid.NewGuid():N}"[..8],
        Name = $"Test Branch {Guid.NewGuid():N}"[..30],
        Address = "123 Test St",
        CreatedAtUtc = DateTime.UtcNow,
        UpdatedAtUtc = DateTime.UtcNow
        };
    }

        private static Customer CreateCustomer(Guid branchId, string phone)
    {
        return new Customer
        {
            Id = Guid.NewGuid(),
            FullName = "Test Customer",
            Phone = phone,
            Email = "test@example.com",
            Address = "456 Test Ave",
            BranchId = branchId,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
    }




}