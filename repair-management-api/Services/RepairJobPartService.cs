using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RepairManagementApi.Services;

public interface IRepairJobPartService
{
    Task<IEnumerable<RepairJobPartResponseDto>> GetJobPartsAsync(Guid jobId);
    Task<RepairJobPartResponseDto> AllocatePartAsync(Guid jobId, AllocatePartRequestDto request);
    Task<bool> RemovePartAsync(Guid jobId, Guid id);
}

public class RepairJobPartService : IRepairJobPartService
{
    private readonly AppDbContext _db;

    public RepairJobPartService(AppDbContext db)
    {
        _db = db;
    }

    private static RepairJobPartResponseDto MapToDto(RepairJobPart rjp) => new()
    {
        Id = rjp.Id,
        PartId = rjp.PartId,
        PartName = rjp.Part != null ? rjp.Part.Name : "Unknown Part",
        PartNumber = rjp.Part != null ? rjp.Part.PartNumber : "N/A",
        Quantity = rjp.Quantity,
        UnitPrice = rjp.UnitPrice,
        AllocatedAtUtc = rjp.AllocatedAtUtc
    };

    public async Task<IEnumerable<RepairJobPartResponseDto>> GetJobPartsAsync(Guid jobId)
    {
        // 1. Verify that the repair job exists
        var jobExists = await _db.RepairJobs.AsNoTracking().AnyAsync(rj => rj.Id == jobId);
        if (!jobExists)
        {
            throw new KeyNotFoundException("REPAIR_JOB_NOT_FOUND");
        }

        // 2. Fetch allocated parts (automatically filtered by multi-tenant global filter)
        var allocations = await _db.RepairJobParts
            .AsNoTracking()
            .Include(rjp => rjp.Part)
            .Where(rjp => rjp.RepairJobId == jobId)
            .OrderBy(rjp => rjp.AllocatedAtUtc)
            .ToListAsync();

        return allocations.Select(MapToDto).ToList();
    }

    public async Task<RepairJobPartResponseDto> AllocatePartAsync(Guid jobId, AllocatePartRequestDto request)
    {
        // 1. Verify Repair Job
        var job = await _db.RepairJobs.FirstOrDefaultAsync(rj => rj.Id == jobId);
        if (job == null)
        {
            throw new KeyNotFoundException("REPAIR_JOB_NOT_FOUND");
        }

        // 2. Verify Part
        var part = await _db.Parts.FirstOrDefaultAsync(p => p.Id == request.PartId);
        if (part == null || !part.IsActive)
        {
            throw new KeyNotFoundException("PART_NOT_FOUND");
        }

        // 3. Verify Stock Level
        if (part.StockQuantity < request.Quantity)
        {
            throw new InvalidOperationException("INSUFFICIENT_STOCK");
        }

        // 4. Execute atomic transaction (all-or-nothing allocation)
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // Check if this part is already allocated to the same repair job
            var existingAllocation = await _db.RepairJobParts
                .FirstOrDefaultAsync(rjp => rjp.RepairJobId == jobId && rjp.PartId == request.PartId);

            Guid allocationId;
            DateTime allocatedAt;

            if (existingAllocation != null)
            {
                existingAllocation.Quantity += request.Quantity;
                allocationId = existingAllocation.Id;
                allocatedAt = existingAllocation.AllocatedAtUtc;
            }
            else
            {
                var jobPart = new RepairJobPart
                {
                    Id = Guid.NewGuid(),
                    RepairJobId = jobId,
                    PartId = request.PartId,
                    Quantity = request.Quantity,
                    UnitPrice = part.SellingPrice,
                    AllocatedAtUtc = DateTime.UtcNow
                };
                _db.RepairJobParts.Add(jobPart);
                allocationId = jobPart.Id;
                allocatedAt = jobPart.AllocatedAtUtc;
            }

            // Decrement Stock Level
            part.StockQuantity -= request.Quantity;

            // Recalculate and update Repair Job Final Cost
            job.FinalCost = (job.FinalCost ?? 0m) + (part.SellingPrice * request.Quantity);

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return new RepairJobPartResponseDto
            {
                Id = allocationId,
                PartId = part.Id,
                PartName = part.Name,
                PartNumber = part.PartNumber,
                Quantity = existingAllocation != null ? existingAllocation.Quantity : request.Quantity,
                UnitPrice = part.SellingPrice,
                AllocatedAtUtc = allocatedAt
            };
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> RemovePartAsync(Guid jobId, Guid id)
    {
        // 1. Fetch the part allocation record
        var jobPart = await _db.RepairJobParts.FirstOrDefaultAsync(rjp => rjp.Id == id);
        if (jobPart == null)
        {
            return false;
        }

        if (jobPart.RepairJobId != jobId)
        {
            throw new InvalidOperationException("INVALID_OPERATION");
        }

        // 2. Fetch associated entities to restore inventory levels and billing totals
        var part = await _db.Parts.FirstOrDefaultAsync(p => p.Id == jobPart.PartId);
        var job = await _db.RepairJobs.FirstOrDefaultAsync(rj => rj.Id == jobId);

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // Restore inventory stock levels
            if (part != null)
            {
                part.StockQuantity += jobPart.Quantity;
            }

            // Deduct total billing cost
            if (job != null)
            {
                job.FinalCost = Math.Max(0m, (job.FinalCost ?? 0m) - (jobPart.UnitPrice * jobPart.Quantity));
            }

            // Remove allocation record
            _db.RepairJobParts.Remove(jobPart);

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return true;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
