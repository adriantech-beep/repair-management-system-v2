using System;

namespace RepairManagementApi.Models;

public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string CompanyName { get; set; } = string.Empty;

    public string Subdomain { get; set; } = string.Empty; // e.g., "shopa" to match shopa.atechlabs.it.com

    // Stripe Subscription Settings
    public string? StripeCustomerId { get; set; }
    
    public string SubscriptionStatus { get; set; } = "Trialing"; // Active, Suspended, Trialing, Cancelled

    public string? LogoUrl { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation properties for relationships
    public List<Branch> Branches { get; set; } = [];
    public List<User> Users { get; set; } = [];
    public List<Customer> Customers { get; set; } = [];
    public List<RepairJob> RepairJobs { get; set; } = [];
}
