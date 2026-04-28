using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;
using RepairManagementApi.Models;

namespace RepairManagementApi.Services;

public class RepairJobService : IRepairJobService
{
    private readonly AppDbContext _db;

    public RepairJobService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<RepairJobResponseDto> CreateRepairJobAsync(CreateRepairJobRequestDto request)
    {
        var branchExists = await _db.Branches.AnyAsync(b => b.Id == request.BranchId);
        if (!branchExists)
            throw new InvalidOperationException("Branch_Not_Found.");

        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == request.CustomerId);
        if (customer is null)
            throw new InvalidOperationException("Customer_Not_Found.");

        var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == request.DeviceId);
        if (device is null)
            throw new InvalidOperationException("Device_Not_Found.");

        if (customer.BranchId != request.BranchId)
            throw new InvalidOperationException("Customer_Not_Assigned_To_Branch.");

        if (device.BranchId != request.BranchId)
            throw new InvalidOperationException("Device_Not_Assigned_To_Branch.");

        if (device.CustomerId != request.CustomerId)
            throw new InvalidOperationException("Device_Not_Assigned_To_Customer.");

        var jobNumber = $"RJ-{DateTime.UtcNow:yyyyMMddHHmmss}";

        var repairJob = new RepairJob
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            DeviceId = request.DeviceId,
            BranchId = request.BranchId,
            JobNumber = jobNumber,
            ProblemDescription = request.ProblemDescription,
            EstimatedCost = request.EstimatedCost,
            Status = RepairJobStatus.Received,
            ReceivedAtUtc = DateTime.UtcNow,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _db.RepairJobs.Add(repairJob);
        await _db.SaveChangesAsync();

        return MapToDto(repairJob);
    }

    public async Task<RepairJobResponseDto?> GetRepairJobByIdAsync(Guid repairJobId)
    {
        var repairJob = await _db.RepairJobs.FirstOrDefaultAsync(r => r.Id == repairJobId);
        return repairJob == null ? null : MapToDto(repairJob);
    }

    public async Task<List<RepairJobListItemDto>> GetRepairJobsByBranchAsync(Guid branchId, RepairJobStatus? status = null)
    {
        var query = _db.RepairJobs.Where(r => r.BranchId == branchId);

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        var repairJobs = await query
            .OrderByDescending(r => r.ReceivedAtUtc)
            .ToListAsync();

        return repairJobs.Select(r => new RepairJobListItemDto
        {
            Id = r.Id,
            CustomerId = r.CustomerId,
            DeviceId = r.DeviceId,
            JobNumber = r.JobNumber,
            ProblemDescription = r.ProblemDescription,
            Status = r.Status,
            EstimatedCost = r.EstimatedCost,
            ReceivedAtUtc = r.ReceivedAtUtc
        }).ToList();
    }

    public async Task<RepairJobResponseDto> UpdateRepairJobAsync(Guid repairJobId, UpdateRepairJobRequestDto request)
    {
        var repairJob = await _db.RepairJobs.FirstOrDefaultAsync(r => r.Id == repairJobId);
        if (repairJob is null)
            throw new InvalidOperationException("RepairJob_Not_Found.");

        repairJob.ProblemDescription = request.ProblemDescription;
        repairJob.DiagnosisNotes = request.DiagnosisNotes;
        repairJob.ResolutionNotes = request.ResolutionNotes;
        repairJob.EstimatedCost = request.EstimatedCost;
        repairJob.FinalCost = request.FinalCost;
        repairJob.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(repairJob);
    }

    public async Task<RepairJobResponseDto> UpdateRepairJobStatusAsync(Guid repairJobId, UpdateRepairJobStatusRequestDto request)
    {
        var repairJob = await _db.RepairJobs.FirstOrDefaultAsync(r => r.Id == repairJobId);
        if (repairJob is null)
            throw new InvalidOperationException("RepairJob_Not_Found.");

        repairJob.Status = request.Status;
        repairJob.UpdatedAtUtc = DateTime.UtcNow;

        if (request.Status == RepairJobStatus.Completed)
            repairJob.CompletedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(repairJob);
    }

    private static RepairJobResponseDto MapToDto(RepairJob repairJob)
    {
        return new RepairJobResponseDto
        {
            Id = repairJob.Id,
            CustomerId = repairJob.CustomerId,
            DeviceId = repairJob.DeviceId,
            BranchId = repairJob.BranchId,
            JobNumber = repairJob.JobNumber,
            ProblemDescription = repairJob.ProblemDescription,
            DiagnosisNotes = repairJob.DiagnosisNotes,
            ResolutionNotes = repairJob.ResolutionNotes,
            EstimatedCost = repairJob.EstimatedCost,
            FinalCost = repairJob.FinalCost,
            Status = repairJob.Status,
            ReceivedAtUtc = repairJob.ReceivedAtUtc,
            CompletedAtUtc = repairJob.CompletedAtUtc,
            CreatedAtUtc = repairJob.CreatedAtUtc,
            UpdatedAtUtc = repairJob.UpdatedAtUtc
        };
    }
}