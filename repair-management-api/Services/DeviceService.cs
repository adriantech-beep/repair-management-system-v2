using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Models;

namespace RepairManagementApi.Services;

public class DeviceService : IDeviceService
{
    private readonly AppDbContext _db;

    public DeviceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DeviceResponseDto> CreateDeviceAsync(CreateDeviceRequestDto request)
    {
        // Validate branch exists
        var branchExists = await _db.Branches.AnyAsync(b => b.Id == request.BranchId);
        if (!branchExists)
            throw new InvalidOperationException("Branch_Not_Found.");

        // Validate customer exists and belongs to branch
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == request.CustomerId);
        if (customer is null)
            throw new InvalidOperationException("Customer_Not_Found.");

        if (customer.BranchId != request.BranchId)
            throw new InvalidOperationException("Customer_Not_Assigned_To_Branch.");

        var device = new Device
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            BranchId = request.BranchId,
            Brand = request.Brand,
            Model = request.Model,
            SerialNumber = request.SerialNumber,
            DeviceType = request.DeviceType,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _db.Devices.Add(device);
        await _db.SaveChangesAsync();

        return MapToDto(device);
    }

    public async Task<DeviceResponseDto?> GetDeviceByIdAsync(Guid deviceId)
    {
        var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == deviceId);
        return device == null ? null : MapToDto(device);
    }

    public async Task<List<DeviceListItemDto>> GetDevicesByCustomerIdAsync(Guid customerId)
    {
        var devices = await _db.Devices
            .Where(d => d.CustomerId == customerId)
            .OrderByDescending(d => d.CreatedAtUtc)
            .ToListAsync();

        return devices.Select(d => new DeviceListItemDto
        {
            Id = d.Id,
            CustomerId = d.CustomerId,
            Brand = d.Brand,
            Model = d.Model,
            DeviceType = d.DeviceType,
            CreatedAtUtc = d.CreatedAtUtc
        }).ToList();
    }

    public async Task<DeviceResponseDto> UpdateDeviceAsync(Guid deviceId, UpdateDeviceRequestDto request)
    {
        var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == deviceId);
        if (device is null)
            throw new InvalidOperationException("Device_Not_Found.");

        device.Brand = request.Brand;
        device.Model = request.Model;
        device.SerialNumber = request.SerialNumber;
        device.DeviceType = request.DeviceType;
        device.UpdatedAtUtc = DateTime.UtcNow;

        _db.Devices.Update(device);
        await _db.SaveChangesAsync();

        return MapToDto(device);
    }

    public async Task DeleteDeviceAsync(Guid deviceId)
    {
        var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == deviceId);
        if (device is null)
            throw new InvalidOperationException("Device_Not_Found.");

        _db.Devices.Remove(device);
        await _db.SaveChangesAsync();
    }

    private static DeviceResponseDto MapToDto(Device device)
    {
        return new DeviceResponseDto
        {
            Id = device.Id,
            CustomerId = device.CustomerId,
            BranchId = device.BranchId,
            Brand = device.Brand,
            Model = device.Model,
            SerialNumber = device.SerialNumber,
            DeviceType = device.DeviceType,
            CreatedAtUtc = device.CreatedAtUtc,
            UpdatedAtUtc = device.UpdatedAtUtc
        };
    }
}