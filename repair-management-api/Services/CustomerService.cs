using RepairManagementApi.Models;
using RepairManagementApi.Enums;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using Microsoft.EntityFrameworkCore;

namespace RepairManagementApi.Services;



public interface ICustomerService
{
    Task<CustomerResponseDto> CreateCustomerAsync(CreateCustomerRequestDto request);
    Task<List<CustomerResponseDto>> GetCustomersAsync(Guid branchId, string? search);
    Task<CustomerResponseDto?> UpdateCustomerAsync(Guid customerId, UpdateCustomerRequestDto request);

    Task<CustomerResponseDto?> GetCustomerByIdAsync(Guid customerId);

}

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;

    public CustomerService(AppDbContext db)
    {
        _db = db;
    }


    private static CustomerResponseDto MapToDto(Customer customer) => new()
    {
        Id = customer.Id,
        FullName = customer.FullName,
        Phone = customer.Phone,
        Email = customer.Email,
        Address = customer.Address,
        BranchId = customer.BranchId,
        CreatedAtUtc = customer.CreatedAtUtc,
        UpdatedAtUtc = customer.UpdatedAtUtc
    };

    public async Task<CustomerResponseDto>
    CreateCustomerAsync(CreateCustomerRequestDto request)
    {
        var branchExists = await _db.Branches.AnyAsync(b => b.Id == request.BranchId);
        if (!branchExists)
        {
            throw new InvalidOperationException("Branch_Not_Found.");
        }

        var duplicatePhone = await _db.Customers.AnyAsync(c => c.Phone == request.Phone && c.BranchId == request.BranchId);
        
        if (duplicatePhone)
        {
            throw new InvalidOperationException("Duplicate_Phone_Number.");
        }

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            BranchId = request.BranchId,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        return MapToDto(customer);

    }

    public async Task<CustomerResponseDto?> GetCustomerByIdAsync(Guid customerId)
        {
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            return customer == null ? null : MapToDto(customer);
        }

    public async Task<List<CustomerResponseDto>> GetCustomersAsync(Guid branchId, string? search)
    {
        var query = _db.Customers
        .Where(c => c.BranchId == branchId)
        .AsQueryable();

        if (!string.IsNullOrEmpty(search))
    {
        query = query.Where(c => c.FullName.Contains(search) || c.Phone.Contains(search));
    }

        var customers = await query
        .OrderBy(c => c.FullName)
        .AsNoTracking()
        .ToListAsync();

        return customers.Select(MapToDto).ToList();
    }

    public async Task<CustomerResponseDto?> UpdateCustomerAsync(Guid customerId, UpdateCustomerRequestDto request)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
        if (customer is null)
        {
            return null;
        }

        if (customer.Phone != request.Phone)
        {
            var duplicatePhone = await _db.Customers.AnyAsync(c => c.Id != customerId && c.BranchId == customer.BranchId && c.Phone == request.Phone);
            if (duplicatePhone)
            {
                throw new InvalidOperationException("Duplicate_Phone_Number.");
            }
        }

        customer.FullName = request.FullName;
        customer.Phone = request.Phone;
        customer.Email = request.Email;
        customer.Address = request.Address;
        customer.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(customer);


    }


}