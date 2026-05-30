using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.Models;
using Stripe;
using System;
using System.IO;
using System.Threading.Tasks;

namespace RepairManagementApi.Controllers;

[ApiController]
[Route("api/webhooks")]
public class WebhookController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public WebhookController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("stripe")]
    public async Task<IActionResult> HandleStripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signatureHeader = Request.Headers["Stripe-Signature"];
        
        var webhookSecret = _config["Stripe:WebhookSecret"];
        if (string.IsNullOrEmpty(webhookSecret))
        {
            return BadRequest(new { message = "Stripe webhook secret is not configured." });
        }

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, webhookSecret);

            if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
                if (session != null)
                {
                    await ProvisionNewTenantAsync(session);
                }
            }
            else if (stripeEvent.Type == EventTypes.CustomerSubscriptionUpdated || stripeEvent.Type == EventTypes.CustomerSubscriptionDeleted)
            {
                var subscription = stripeEvent.Data.Object as Stripe.Subscription;
                if (subscription != null)
                {
                    await UpdateSubscriptionStatusAsync(subscription);
                }
            }

            return Ok();
        }
        catch (StripeException ex)
        {
            return BadRequest(new { message = $"Webhook signature verification failed: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal provisioning failure: {ex.Message}" });
        }
    }

    private async Task ProvisionNewTenantAsync(Stripe.Checkout.Session session)
    {
        // 1. Extract session metadata passed from the onboarding signup form
        if (session.Metadata == null || 
            !session.Metadata.TryGetValue("Subdomain", out var subdomain) ||
            !session.Metadata.TryGetValue("CompanyName", out var companyName) ||
            !session.Metadata.TryGetValue("AdminFullName", out var adminFullName) ||
            !session.Metadata.TryGetValue("AdminEmail", out var adminEmail) ||
            !session.Metadata.TryGetValue("AdminPasswordHash", out var adminPasswordHash))
        {
            Console.WriteLine($"[Webhook Error] Metadata missing for Checkout Session {session.Id}");
            return;
        }

        // 2. Open an EF Core database transaction to guarantee atomicity (all-or-nothing provisioning)
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // A. Create new Tenant
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                CompanyName = companyName,
                Subdomain = subdomain,
                StripeCustomerId = session.CustomerId,
                SubscriptionStatus = "Active",
                CreatedAtUtc = DateTime.UtcNow
            };
            _db.Tenants.Add(tenant);
            await _db.SaveChangesAsync();

            // B. Create default Main Branch for the Tenant
            var branch = new Branch
            {
                Id = Guid.NewGuid(),
                Code = "MAIN",
                Name = "Main Branch",
                Address = "Default Main Office",
                TenantId = tenant.Id,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };
            _db.Branches.Add(branch);
            await _db.SaveChangesAsync();

            // C. Create the Tenant Primary Admin account
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = adminFullName,
                Email = adminEmail,
                PasswordHash = adminPasswordHash,
                Role = Enums.Role.Admin,
                IsActive = true,
                FailedLoginAttempts = 0,
                LockoutEndUtc = null,
                MustChangePassword = false,
                TenantId = tenant.Id,
                BranchId = branch.Id,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };
            _db.Users.Add(adminUser);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();
            Console.WriteLine($"✓ [Webhook Success] Fully provisioned SaaS tenant: '{companyName}' (subdomain: {subdomain})");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"❌ [Webhook Error] Tenant provisioning failed for session {session.Id}. Error: {ex.Message}");
            throw;
        }
    }

    private async Task UpdateSubscriptionStatusAsync(Stripe.Subscription subscription)
    {
        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.StripeCustomerId == subscription.CustomerId);
        if (tenant == null)
        {
            Console.WriteLine($"[Webhook Warning] No tenant found with Stripe Customer ID: {subscription.CustomerId}");
            return;
        }

        // Map Stripe Subscription statuses into simple Active/Suspended binary states
        var mappedStatus = "Suspended";
        if (subscription.Status == "active" || subscription.Status == "trialing")
        {
            mappedStatus = "Active";
        }

        if (tenant.SubscriptionStatus != mappedStatus)
        {
            tenant.SubscriptionStatus = mappedStatus;
            await _db.SaveChangesAsync();
            Console.WriteLine($"✓ [Webhook Subscription Update] Tenant '{tenant.CompanyName}' status updated to {mappedStatus} (Stripe state: {subscription.Status})");
        }
    }
}
