using System.Reflection;
using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;
using RepairManagementApi.Models;
using RepairManagementApi.Services;


namespace RepairManagementApi.Tests;
public class RepairJobServiceTests
{
    [Fact]
    public async Task CreateRepairJobAsync_WithValidData_CreatesRepairJob()
    {
    
    await using var db = CreateDbContext();

    var branch = CreateBranch();
    db.Branches.Add(branch);

    var customer = CreateCustomer(branch.Id);
    db.Customers.Add(customer);

    var device = CreateDevice(customer.Id, branch.Id);
    db.Devices.Add(device);

    await db.SaveChangesAsync();

    var service = new RepairJobService(db);

    var result = await service.CreateRepairJobAsync(new CreateRepairJobRequestDto
    {
        CustomerId = customer.Id,
        DeviceId = device.Id,
        BranchId = branch.Id,
        ProblemDescription = "Screen is cracked",
        EstimatedCost = 150.00m
    });


        Assert.NotNull(result);
        Assert.Equal(device.Id, result.DeviceId);
        Assert.Equal("Screen is cracked", result.ProblemDescription);
        Assert.Equal(RepairJobStatus.Received, result.Status);
        Assert.Equal(customer.Id, result.CustomerId);
    }



    [Fact]
    public async Task CreateRepairJobAsync_NonExistentBranch_ThrowsBranchNotFound()
    {
      // Arrange
        await using var db = CreateDbContext();

        var branch = CreateBranch();
        db.Branches.Add(branch);

        var customer = CreateCustomer(branch.Id);
        db.Customers.Add(customer);

        var device = CreateDevice(customer.Id, branch.Id);
        db.Devices.Add(device);

        await db.SaveChangesAsync();

        var service = new RepairJobService(db);

        // Act
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
        service.CreateRepairJobAsync(new CreateRepairJobRequestDto
        {
            CustomerId = customer.Id,
            DeviceId = device.Id,
            BranchId = Guid.NewGuid(),
            ProblemDescription = "Screen is cracked",
            EstimatedCost = 150.00m
        }));

        // Assert
        Assert.Equal("Branch_Not_Found.", ex.Message);
    }

    [Fact]
    public async Task CreateRepairJobAsync_NonExistentCustomer_ThrowsCustomerNotFound()
    {
        // Arrange
        await using var db = CreateDbContext();

        var branch = CreateBranch();
        db.Branches.Add(branch);

        var customer = CreateCustomer(branch.Id);
        db.Customers.Add(customer);

        var device = CreateDevice(customer.Id, branch.Id);
        db.Devices.Add(device);

        await db.SaveChangesAsync();

        var service = new RepairJobService(db);

        // Act
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateRepairJobAsync(new CreateRepairJobRequestDto
            {
                CustomerId = Guid.NewGuid(),
                DeviceId = device.Id,
                BranchId = branch.Id,
                ProblemDescription = "Screen is cracked",
                EstimatedCost = 150.00m
            }));

        // Assert
        Assert.Equal("Customer_Not_Found.", ex.Message);
    }

    [Fact]
    public async Task
    CreateRepairJobAsync_NonExistentDevice_ThrowsDeviceNotFound()
        {
            // Arrange
            await using var db = CreateDbContext();
    
            var branch = CreateBranch();
            db.Branches.Add(branch);
    
            var customer = CreateCustomer(branch.Id);
            db.Customers.Add(customer);
    
            var device = CreateDevice(customer.Id, branch.Id);
            db.Devices.Add(device);
    
            await db.SaveChangesAsync();
    
            var service = new RepairJobService(db);
    
            // Act
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreateRepairJobAsync(new CreateRepairJobRequestDto
                {
                    CustomerId = customer.Id,
                    DeviceId = Guid.NewGuid(),
                    BranchId = branch.Id,
                    ProblemDescription = "Screen is cracked",
                    EstimatedCost = 150.00m
                }));
    
            // Assert
            Assert.Equal("Device_Not_Found.", ex.Message);
        }

        [Fact]
        public async Task CreateRepairJobAsync_CustomerNotInBranch_ThrowsCustomerNotAssignedToBranch()
        {
            // Arrange
            await using var db = CreateDbContext();
    
            var branch = CreateBranch();
            db.Branches.Add(branch);
    
            var customer = CreateCustomer(branch.Id);
            db.Customers.Add(customer);
    
            var device = CreateDevice(customer.Id, branch.Id);
            db.Devices.Add(device);
    
            // Create a second branch
            var otherBranch = CreateBranch();
            db.Branches.Add(otherBranch);
    
            await db.SaveChangesAsync();
    
            var service = new RepairJobService(db);
    
            // Act
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreateRepairJobAsync(new CreateRepairJobRequestDto
                {
                    CustomerId = customer.Id,
                    DeviceId = device.Id,
                    BranchId = otherBranch.Id,
                    ProblemDescription = "Screen is cracked",
                    EstimatedCost = 150.00m
                }));
    
            // Assert
            Assert.Equal("Customer_Not_Assigned_To_Branch.", ex.Message);
        }


        [Fact]
        public async Task 
        GetRepairJobByIdAsync_ExistingRepairJob_ReturnsRepairJob()
        {
            // Arrange
            await using var db = CreateDbContext();
    
            var branch = CreateBranch();
            db.Branches.Add(branch);
    
            var customer = CreateCustomer(branch.Id);
            db.Customers.Add(customer);
    
            var device = CreateDevice(customer.Id, branch.Id);
            db.Devices.Add(device);
    
            var repairJob = CreateRepairJob(customer.Id, device.Id, branch.Id);
            db.RepairJobs.Add(repairJob);
    
            await db.SaveChangesAsync();
    
            var service = new RepairJobService(db);
    
            // Act
            var result = await service.GetRepairJobByIdAsync(repairJob.Id);
    
            // Assert
            Assert.NotNull(result);
            Assert.Equal(repairJob.Id, result!.Id);
            Assert.Equal(device.Id, result.DeviceId);
            Assert.Equal("Test problem", result.ProblemDescription);
        }


        [Fact]
        public async Task GetRepairJobsByBranchAsync_ExistingBranch_ReturnsRepairJobs()
        {
            // Arrange
            await using var db = CreateDbContext();
    
            var branch = CreateBranch();
            db.Branches.Add(branch);
    
            var customer = CreateCustomer(branch.Id);
            db.Customers.Add(customer);
    
            var device = CreateDevice(customer.Id, branch.Id);
            db.Devices.Add(device);
    
            var repairJob1 = CreateRepairJob(customer.Id, device.Id, branch.Id);
            var repairJob2 = CreateRepairJob(customer.Id, device.Id, branch.Id);
            db.RepairJobs.AddRange(repairJob1, repairJob2);
    
            await db.SaveChangesAsync();
    
            var service = new RepairJobService(db);
    
            // Act
            var result = await service.GetRepairJobsByBranchAsync(branch.Id);
    
            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task UpdateRepairJobAsync_ExistingRepairJob_UpdatesRepairJob()
        {
            // Arrange
            await using var db = CreateDbContext();
    
            var branch = CreateBranch();
            db.Branches.Add(branch);
    
            var customer = CreateCustomer(branch.Id);
            db.Customers.Add(customer);
    
            var device = CreateDevice(customer.Id, branch.Id);
            db.Devices.Add(device);
    
            var repairJob = CreateRepairJob(customer.Id, device.Id, branch.Id);
            db.RepairJobs.Add(repairJob);
    
            await db.SaveChangesAsync();
    
            var service = new RepairJobService(db);
    
            // Act
            var result = await service.UpdateRepairJobAsync(repairJob.Id, new UpdateRepairJobRequestDto
            {
                ProblemDescription = "Updated problem description",
                DiagnosisNotes = "Diagnosed issue",
                ResolutionNotes = "Resolved issue",
                EstimatedCost = 200.00m,
                FinalCost = 180.00m,
            });
    
            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated problem description", result!.ProblemDescription);
            Assert.Equal("Diagnosed issue", result.DiagnosisNotes);
            Assert.Equal("Resolved issue", result.ResolutionNotes);
            Assert.Equal(200.00m, result.EstimatedCost);
            Assert.Equal(180.00m, result.FinalCost);
        }

        [Fact]
        public async Task UpdateRepairJobStatusAsync_ExistingRepairJob_UpdatesStatus()
        {
            // Arrange
            await using var db = CreateDbContext();
    
            var branch = CreateBranch();
            db.Branches.Add(branch);
    
            var customer = CreateCustomer(branch.Id);
            db.Customers.Add(customer);
    
            var device = CreateDevice(customer.Id, branch.Id);
            db.Devices.Add(device);
    
            var repairJob = CreateRepairJob(customer.Id, device.Id, branch.Id);
            db.RepairJobs.Add(repairJob);
    
            await db.SaveChangesAsync();
    
            var service = new RepairJobService(db);
    
            // Act
            var result = await service.UpdateRepairJobStatusAsync(repairJob.Id, new UpdateRepairJobStatusRequestDto
            {
                Status = RepairJobStatus.Completed
            });
    
            // Assert
            Assert.NotNull(result);
            Assert.Equal(RepairJobStatus.Completed, result!.Status);
        }

        [Fact]
        public async Task UpdateRepairJobStatusAsync_NonExistentRepairJob_ThrowsRepairJobNotFound()
        {
            // Arrange
            await using var db = CreateDbContext();
    
            var service = new RepairJobService(db);
    
            // Act
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateRepairJobStatusAsync(Guid.NewGuid(), new UpdateRepairJobStatusRequestDto
                {
                    Status = RepairJobStatus.Completed
                }));
    
            // Assert
            Assert.Equal("RepairJob_Not_Found.", ex.Message);
        }


        [Fact]
        public async Task GetRepairJobByIdAsync_NonExistentRepairJob_ReturnsNull()
        {
            // Arrange
            await using var db = CreateDbContext();
            var service = new RepairJobService(db);

            // Act
            var result = await service.GetRepairJobByIdAsync(Guid.NewGuid());

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetRepairJobsByBranchAsync_WithStatusFilter_ReturnsFilteredRows()
        {
            // Arrange
            await using var db = CreateDbContext();

            var branch = CreateBranch();
            db.Branches.Add(branch);

            var customer = CreateCustomer(branch.Id);
            db.Customers.Add(customer);

            var device = CreateDevice(customer.Id, branch.Id);
            db.Devices.Add(device);

            var receivedJob = CreateRepairJob(customer.Id, device.Id, branch.Id);
            receivedJob.Status = RepairJobStatus.Received;

            var completedJob = CreateRepairJob(customer.Id, device.Id, branch.Id);
            completedJob.Status = RepairJobStatus.Completed;
            completedJob.CompletedAtUtc = DateTime.UtcNow;

            db.RepairJobs.AddRange(receivedJob, completedJob);
            await db.SaveChangesAsync();

            var service = new RepairJobService(db);

            // Act
            var result = await service.GetRepairJobsByBranchAsync(branch.Id, RepairJobStatus.Completed);

            // Assert
            Assert.Single(result);
            Assert.Equal(RepairJobStatus.Completed, result[0].Status);
            Assert.Equal(completedJob.Id, result[0].Id);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options;
        return new AppDbContext(options);
    }

    private static Branch CreateBranch() => new Branch
    {
        Id = Guid.NewGuid(),
        Code = Guid.NewGuid().ToString("N")[..8],
        Name = Guid.NewGuid().ToString("N")[..20],
        CreatedAtUtc = DateTime.UtcNow,
        UpdatedAtUtc = DateTime.UtcNow
    };

    private static Customer CreateCustomer(Guid branchId) => new Customer
    {
        Id = Guid.NewGuid(),
        FullName = "Test Customer",
        Phone = "555-0001",
        BranchId = branchId,
        CreatedAtUtc = DateTime.UtcNow,
        UpdatedAtUtc = DateTime.UtcNow
    };

    private static Device CreateDevice(Guid customerId, Guid branchId) => new Device
    {
        Id = Guid.NewGuid(),
        CustomerId = customerId,
        BranchId = branchId,
        Brand = "Apple",
        Model = "iPhone 14",
        DeviceType = DeviceType.Mobile,
        CreatedAtUtc = DateTime.UtcNow,
        UpdatedAtUtc = DateTime.UtcNow
    };

    private static RepairJob CreateRepairJob(Guid customerId, Guid deviceId, Guid branchId) => new RepairJob
    {
        Id = Guid.NewGuid(),
        CustomerId = customerId,
        DeviceId = deviceId,
        BranchId = branchId,
        JobNumber = $"RJ-TEST-{Guid.NewGuid().ToString("N")[..6]}",
        ProblemDescription = "Test problem",
        Status = RepairJobStatus.Received,
        ReceivedAtUtc = DateTime.UtcNow,
        CreatedAtUtc = DateTime.UtcNow,
        UpdatedAtUtc = DateTime.UtcNow
    };
}