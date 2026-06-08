using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Services;
using System;
using System.Threading.Tasks;

namespace RepairManagementApi.Controllers;

[ApiController]
[Route("api/tenant")]
[Authorize]
public class TenantController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IImageUploadService _imageUploadService;

    public TenantController(
        AppDbContext db,
        ITenantContext tenantContext,
        IImageUploadService imageUploadService)
    {
        _db = db;
        _tenantContext = tenantContext;
        _imageUploadService = imageUploadService;
    }

    [HttpGet]
    public async Task<ActionResult<TenantDto>> GetTenantSettings()
    {
        var tenantId = _tenantContext.TenantId;
        if (!tenantId.HasValue)
        {
            return BadRequest(new { code = "NO_TENANT_CONTEXT", message = "Request is not associated with any active tenant." });
        }

        var tenant = await _db.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tenantId.Value);

        if (tenant == null)
        {
            return NotFound(new { code = "TENANT_NOT_FOUND", message = "Tenant settings not found." });
        }

        return Ok(new TenantDto
        {
            Id = tenant.Id,
            CompanyName = tenant.CompanyName,
            Subdomain = tenant.Subdomain,
            LogoUrl = tenant.LogoUrl,
            SubscriptionStatus = tenant.SubscriptionStatus,
            CreatedAtUtc = tenant.CreatedAtUtc
        });
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<PublicTenantDto>> GetPublicTenantSettings()
    {
        var tenantId = _tenantContext.TenantId;
        if (!tenantId.HasValue)
        {
            return BadRequest(new { code = "NO_TENANT_CONTEXT", message = "Request is not associated with any active tenant." });
        }

        var tenant = await _db.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tenantId.Value);

        if (tenant == null)
        {
            return NotFound(new { code = "TENANT_NOT_FOUND", message = "Tenant settings not found." });
        }

        return Ok(new PublicTenantDto
        {
            CompanyName = tenant.CompanyName,
            LogoUrl = tenant.LogoUrl
        });
    }

    [HttpPut]
    [Authorize(Roles = "Admin")] // Only administrators can update settings
    public async Task<IActionResult> UpdateTenantSettings([FromBody] UpdateTenantRequestDto request)
    {
        var tenantId = _tenantContext.TenantId;
        if (!tenantId.HasValue)
        {
            return BadRequest(new { code = "NO_TENANT_CONTEXT", message = "Request is not associated with any active tenant." });
        }

        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId.Value);
        if (tenant == null)
        {
            return NotFound(new { code = "TENANT_NOT_FOUND", message = "Tenant not found." });
        }

        tenant.CompanyName = request.CompanyName;
        tenant.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("logo")]
    [Authorize(Roles = "Admin")] // Only administrators can upload a logo
    public async Task<ActionResult<object>> UploadLogo([FromForm] IFormFile file)
    {
        var tenantId = _tenantContext.TenantId;
        if (!tenantId.HasValue)
        {
            return BadRequest(new { code = "NO_TENANT_CONTEXT", message = "Request is not associated with any active tenant." });
        }

        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId.Value);
        if (tenant == null)
        {
            return NotFound(new { code = "TENANT_NOT_FOUND", message = "Tenant not found." });
        }

        // Upload the logo inside a dedicated folder for this tenant on Cloudinary
        var folderName = $"repair-management/tenants/{tenant.Subdomain}";
        var uploadResult = await _imageUploadService.UploadImageAsync(file, folderName);

        if (!uploadResult.IsSuccess)
        {
            return BadRequest(new { code = "UPLOAD_FAILED", message = uploadResult.ErrorMessage });
        }

        // Update database with the new logo URL
        tenant.LogoUrl = uploadResult.SecureUrl;
        tenant.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { logoUrl = tenant.LogoUrl });
    }

    [HttpDelete("logo")]
    [Authorize(Roles = "Admin")] // Only administrators can remove a logo
    public async Task<IActionResult> DeleteLogo()
    {
        var tenantId = _tenantContext.TenantId;
        if (!tenantId.HasValue)
        {
            return BadRequest(new { code = "NO_TENANT_CONTEXT", message = "Request is not associated with any active tenant." });
        }

        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId.Value);
        if (tenant == null)
        {
            return NotFound(new { code = "TENANT_NOT_FOUND", message = "Tenant not found." });
        }

        tenant.LogoUrl = null;
        tenant.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
