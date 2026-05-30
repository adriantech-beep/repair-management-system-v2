using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.Services;

namespace RepairManagementApi.Middleware;

public class TenantResolverMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolverMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db, TenantContext tenantContext)
    {
        string? subdomain = null;

        // 1. Resolve tenant subdomain:
        // A. Check custom HTTP Header (passed by frontend client)
        if (context.Request.Headers.TryGetValue("X-Tenant-Subdomain", out var headerVal))
        {
            subdomain = headerVal.ToString().Trim().ToLowerInvariant();
        }

        // B. Check CORS Origin header (passed by browsers during API cross-origin requests)
        if (string.IsNullOrEmpty(subdomain) && context.Request.Headers.TryGetValue("Origin", out var originVal))
        {
            var origin = originVal.ToString();
            if (Uri.TryCreate(origin, UriKind.Absolute, out var originUri))
            {
                var originHost = originUri.Host;
                var originParts = originHost.Split('.');
                // Ensure it is a tenant subdomain and not a root domain like "atechlabs.it.com"
                if (originParts.Length > 2 && originParts[0] != "www" && originParts[0] != "api")
                {
                    subdomain = originParts[0].ToLowerInvariant();
                }
            }
        }

        // C. Check Host header (fallback for direct API requests or local development)
        if (string.IsNullOrEmpty(subdomain))
        {
            var host = context.Request.Host.Host;
            var hostParts = host.Split('.');
            if (hostParts.Length > 2 && hostParts[0] != "api" && hostParts[0] != "www")
            {
                subdomain = hostParts[0].ToLowerInvariant();
            }
            else if (host.Equals("localhost", StringComparison.OrdinalIgnoreCase) || host.Equals("127.0.0.1"))
            {
                subdomain = "localhost";
            }
        }

        if (string.IsNullOrEmpty(subdomain))
        {
            subdomain = "default";
        }

        // 2. Fetch Tenant settings from DB
        Models.Tenant? tenant = null;

        // Dev-friendly fallback: If running on localhost, auto-resolve to the first tenant so development stays seamless
        if (subdomain == "localhost")
        {
            tenant = await db.Tenants.AsNoTracking().FirstOrDefaultAsync();
        }
        else
        {
            tenant = await db.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Subdomain == subdomain);
        }

        if (tenant is null)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { code = "SHOP_NOT_FOUND", message = $"Shop subdomain '{subdomain}' is not registered." });
            return;
        }

        // 3. Subscription Status Check (Automated SaaS suspension)
        if (tenant.SubscriptionStatus.Equals("Suspended", StringComparison.OrdinalIgnoreCase))
        {
            context.Response.StatusCode = StatusCodes.Status402PaymentRequired;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { code = "SUBSCRIPTION_SUSPENDED", message = "Subscription suspended. Please update billing." });
            return;
        }

        // 4. Inject Context (this scoped context will be shared with EF Core and our controllers)
        tenantContext.TenantId = tenant.Id;
        tenantContext.Subdomain = tenant.Subdomain;

        await _next(context);
    }
}
