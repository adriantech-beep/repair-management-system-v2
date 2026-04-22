using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;
using RepairManagementApi.Models;

namespace RepairManagementApi.Services;

public interface IWaitlistService
{
    Task<WaitlistResponseDto?> CreateWaitlistRequestAsync(Guid partId, CreateWaitlistRequestDto request);
    Task<List<WaitlistResponseDto>> GetWaitlistByPartAsync(Guid partId, WaitlistStatus? status);
    Task<WaitlistResponseDto?> UpdateStatusAsync(Guid waitlistRequestId, UpdateWaitlistStatusRequestDto request);
}

public class WaitlistService : IWaitlistService
{
    private readonly AppDbContext _db;

    public WaitlistService(AppDbContext db)
    {
        _db = db;
    }


    private static WaitlistResponseDto MapToDto(PartWaitlistRequest request) => new()
    {
    Id = request.Id,
    PartId = request.PartId,
    CustomerName = request.CustomerName,
    CustomerEmail = request.CustomerEmail,
    CustomerPhone = request.CustomerPhone,
    PreferredContactMethod = request.PreferredContactMethod,
    Status = request.Status.ToString(),
    CreatedAtUtc = request.CreatedAtUtc,
    NotifiedAtUtc = request.NotifiedAtUtc,
    ResolvedAtUtc = request.ResolvedAtUtc,
    Notes = request.Notes
    };
    

public async Task<WaitlistResponseDto?> CreateWaitlistRequestAsync(Guid partId, CreateWaitlistRequestDto request)
{


    var partExists = await _db.Parts.AnyAsync(p => p.Id == partId);
    if (!partExists)
        return null;

    var email = string.IsNullOrWhiteSpace(request.CustomerEmail)
        ? null
        : request.CustomerEmail.Trim().ToLowerInvariant();

    var phone = string.IsNullOrWhiteSpace(request.CustomerPhone)
        ? null
        : request.CustomerPhone.Trim();

    // Rule 1: At least one contact method must exist
    if (email is null && phone is null)
        throw new InvalidOperationException("CONTACT_REQUIRED");

    // Rule 2: Preferred method must actually be present
    if (request.PreferredContactMethod == PreferredContactMethod.Email && email is null)
        throw new InvalidOperationException("PREFERRED_CONTACT_MISSING");

    if (request.PreferredContactMethod == PreferredContactMethod.Phone && phone is null)
        throw new InvalidOperationException("PREFERRED_CONTACT_MISSING");

    // Rule 3: Prevent duplicate active request (Pending or Notified) for same part + same contact
    var hasDuplicateActiveRequest = await _db.PartWaitlistRequests.AnyAsync(w =>
        w.PartId == partId &&
        (w.Status == WaitlistStatus.Pending || w.Status == WaitlistStatus.Notified) &&
        (
            (email != null && w.CustomerEmail == email) ||
            (phone != null && w.CustomerPhone == phone)
        )
    );

    if (hasDuplicateActiveRequest)
        throw new InvalidOperationException("DUPLICATE_WAITLIST_REQUEST");

    var waitlistRequest = new PartWaitlistRequest
    {
        Id = Guid.NewGuid(),
        PartId = partId,
        CustomerName = request.CustomerName.Trim(),
        CustomerEmail = email,
        CustomerPhone = phone,
        PreferredContactMethod = request.PreferredContactMethod,
        Status = WaitlistStatus.Pending,
        Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
        CreatedAtUtc = DateTime.UtcNow,
        NotifiedAtUtc = null,
        ResolvedAtUtc = null
    };

    _db.PartWaitlistRequests.Add(waitlistRequest);
    await _db.SaveChangesAsync();

    return MapToDto(waitlistRequest);
}

public async Task<List<WaitlistResponseDto>> GetWaitlistByPartAsync(Guid partId, WaitlistStatus? status)
{
    var query = _db.PartWaitlistRequests
        .Where(w => w.PartId == partId)
        .AsQueryable();

    if (status.HasValue)
    {
        query = query.Where(w => w.Status == status.Value);
    }

    var items = await query
        .OrderByDescending(w => w.CreatedAtUtc)
        .ToListAsync();

    return items.Select(MapToDto).ToList();
}

public async Task<WaitlistResponseDto?> UpdateStatusAsync(Guid waitlistRequestId, UpdateWaitlistStatusRequestDto request)
{
    var waitlistRequest = await _db.PartWaitlistRequests
        .FirstOrDefaultAsync(w => w.Id == waitlistRequestId);

    if (waitlistRequest is null)
        return null;

    waitlistRequest.Status = request.Status;

    if (request.Status == WaitlistStatus.Notified && waitlistRequest.NotifiedAtUtc is null)
    {
        waitlistRequest.NotifiedAtUtc = DateTime.UtcNow;
    }

    if (request.Status == WaitlistStatus.Resolved)
    {
        waitlistRequest.ResolvedAtUtc = DateTime.UtcNow;
    }

    await _db.SaveChangesAsync();

    return MapToDto(waitlistRequest);
}
}