using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Services;
using Stripe;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RepairManagementApi.Controllers;

[ApiController]
[Route("api/onboarding")]
public class OnboardingController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _config;

    public OnboardingController(AppDbContext db, IPasswordHasher passwordHasher, IConfiguration config)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _config = config;
    }

    [HttpGet("check-subdomain")]
    public async Task<IActionResult> CheckSubdomain([FromQuery] string subdomain)
    {
        if (string.IsNullOrWhiteSpace(subdomain))
        {
            return BadRequest(new { available = false, message = "Subdomain cannot be empty." });
        }

        var normalized = subdomain.Trim().ToLowerInvariant();
        var isReserved = normalized == "api" || normalized == "www" || normalized == "default" || normalized == "localhost";
        if (isReserved)
        {
            return Ok(new { available = false, message = "Subdomain is reserved for system use." });
        }

        // Validate subdomain characters (only lowercase letters, numbers, and hyphens)
        var isValid = System.Text.RegularExpressions.Regex.IsMatch(normalized, @"^[a-z0-9\-]+$");
        if (!isValid)
        {
            return Ok(new { available = false, message = "Subdomain can only contain lowercase letters, numbers, and hyphens." });
        }

        var exists = await _db.Tenants.AnyAsync(t => t.Subdomain == normalized);
        if (exists)
        {
            return Ok(new { available = false, message = "This subdomain is already taken." });
        }

        return Ok(new { available = true, message = "Subdomain is available!" });
    }

    [HttpGet("session-details")]
    public async Task<IActionResult> GetSessionDetails([FromQuery] string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return BadRequest(new { message = "Session ID is required." });
        }

        var stripeSecretKey = _config["Stripe:SecretKey"];
        if (string.IsNullOrEmpty(stripeSecretKey))
        {
            return BadRequest(new { message = "SaaS billing integration key is not configured." });
        }
        StripeConfiguration.ApiKey = stripeSecretKey;

        try
        {
            var service = new SessionService();
            Session session = await service.GetAsync(sessionId);

            if (session?.Metadata == null || !session.Metadata.TryGetValue("Subdomain", out var subdomain))
            {
                return NotFound(new { message = "Onboarding metadata not found for this checkout session." });
            }

            session.Metadata.TryGetValue("CompanyName", out var companyName);
            session.Metadata.TryGetValue("AdminEmail", out var email);

            return Ok(new
            {
                subdomain,
                companyName = companyName ?? "Your Shop",
                email = email ?? ""
            });
        }
        catch (StripeException ex)
        {
            return BadRequest(new { message = $"Stripe error: {ex.Message}" });
        }
    }

    [HttpPost("signup")]
    public async Task<ActionResult<OnboardingSignupResponseDto>> Signup([FromBody] OnboardingSignupRequestDto request)
    {
        var normalizedSubdomain = request.Subdomain.Trim().ToLowerInvariant();
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        // 1. Check if subdomain is already taken
        var subdomainExists = await _db.Tenants.AnyAsync(t => t.Subdomain == normalizedSubdomain);
        if (subdomainExists || normalizedSubdomain == "api" || normalizedSubdomain == "www" || normalizedSubdomain == "default")
        {
            return BadRequest(new
            {
                code = "SUBDOMAIN_TAKEN",
                message = $"Subdomain '{normalizedSubdomain}' is already registered or reserved."
            });
        }

        // 2. Check if admin email already exists (emails must be unique globally in multi-tenancy auth)
        var emailExists = await _db.Users.AnyAsync(u => u.Email == normalizedEmail);
        if (emailExists)
        {
            return BadRequest(new
            {
                code = "EMAIL_TAKEN",
                message = "An account with this email address is already registered."
            });
        }

        // 3. Initialize Stripe
        var stripeSecretKey = _config["Stripe:SecretKey"];
        if (string.IsNullOrEmpty(stripeSecretKey))
        {
            return BadRequest(new
            {
                code = "STRIPE_CONFIG_MISSING",
                message = "SaaS billing integration key is not configured on the server."
            });
        }
        StripeConfiguration.ApiKey = stripeSecretKey;

        // Determine success & cancel redirect URLs
        var clientAppUrl = _config["Stripe:SuccessUrl"] ?? "https://atechlabs.it.com"; // Redirect base
        var successUrl = $"{clientAppUrl}/onboarding/success?session_id={{CHECKOUT_SESSION_ID}}";
        var cancelUrl = $"{clientAppUrl}/signup";

        // 4. Build Session Options (Subscription Mode with Dynamic Price Details)
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            CustomerEmail = request.Email,
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "usd",
                        UnitAmount = 4900, // $49.00 / month
                        Recurring = new SessionLineItemPriceDataRecurringOptions
                        {
                            Interval = "month"
                        },
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = "Repair Management Premium SaaS Plan",
                            Description = "Full access to branch operations, dynamic inventory tracking, customer waitlists, and technician logs."
                        }
                    },
                    Quantity = 1
                }
            },
            Mode = "subscription",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            Metadata = new Dictionary<string, string>
            {
                { "Subdomain", normalizedSubdomain },
                { "CompanyName", request.CompanyName },
                { "AdminFullName", request.FullName },
                { "AdminEmail", normalizedEmail },
                { "AdminPasswordHash", _passwordHasher.Hash(request.Password) }
            }
        };

        try
        {
            var service = new SessionService();
            Session session = await service.CreateAsync(options);

            return Ok(new OnboardingSignupResponseDto
            {
                CheckoutUrl = session.Url
            });
        }
        catch (StripeException ex)
        {
            return BadRequest(new
            {
                code = "STRIPE_INTEGRATION_ERROR",
                message = $"Stripe integration error: {ex.Message}"
            });
        }
    }
}
