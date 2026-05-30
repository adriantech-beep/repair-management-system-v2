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
