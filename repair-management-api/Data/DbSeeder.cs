using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Models;
using RepairManagementApi.Services;
using RepairManagementApi.Enums;

namespace RepairManagementApi.Data
{
    public static class DbSeeder
    {
        public static async Task SeedInitialDataAsync(IApplicationBuilder app)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

                // Apply pending migrations
                await dbContext.Database.MigrateAsync();

                // 1. Seed default Tenant if none exists
                var defaultTenant = await dbContext.Tenants.FirstOrDefaultAsync();
                if (defaultTenant is null)
                {
                    defaultTenant = new Tenant
                    {
                        Id = Guid.Parse("99999999-9999-9999-9999-999999999999"),
                        CompanyName = "Atech Labs",
                        Subdomain = "localhost",
                        StripeCustomerId = null,
                        SubscriptionStatus = "Active",
                        CreatedAtUtc = DateTime.UtcNow
                    };
                    dbContext.Tenants.Add(defaultTenant);
                    await dbContext.SaveChangesAsync();
                    Console.WriteLine("✓ Default tenant seeded: Atech Labs (localhost)");
                }

                // 2. Seed default Branch if none exists
                var defaultBranch = await dbContext.Branches.FirstOrDefaultAsync();
                if (defaultBranch is null)
                {
                    defaultBranch = new Branch
                    {
                        Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                        Code = "MAIN",
                        Name = "Main Branch",
                        Address = "123 Main Street",
                        TenantId = defaultTenant.Id,
                        CreatedAtUtc = DateTime.UtcNow,
                        UpdatedAtUtc = DateTime.UtcNow
                    };
                    dbContext.Branches.Add(defaultBranch);
                    await dbContext.SaveChangesAsync();
                    Console.WriteLine("✓ Default branch seeded: Main Branch");
                }

                // 3. Seed Admin user if none exists
                if (!dbContext.Users.Any())
                {
                    var adminUser = new User
                    {
                        FullName = "Admin User",
                        Email = "admin@repairmanagement.local",
                        PasswordHash = passwordHasher.Hash("AdminPassword123!"),
                        Role = Role.Admin,
                        IsActive = true,
                        FailedLoginAttempts = 0,
                        LockoutEndUtc = null,
                        MustChangePassword = false,
                        TenantId = defaultTenant.Id,
                        CreatedAtUtc = DateTime.UtcNow,
                        UpdatedAtUtc = DateTime.UtcNow,
                        BranchId = defaultBranch.Id
                    };

                    dbContext.Users.Add(adminUser);
                    await dbContext.SaveChangesAsync();

                    Console.WriteLine("✓ Admin user seeded: admin@repairmanagement.local / AdminPassword123!");
                }

                // 4. Seed Technician users if none exist
                if (!dbContext.Users.Any(u => u.Role == Role.Technician))
                {
                    var tech1 = new User
                    {
                        FullName = "John Tech",
                        Email = "john.tech@repairmanagement.local",
                        PasswordHash = passwordHasher.Hash("TechPassword123!"),
                        Role = Role.Technician,
                        IsActive = true,
                        FailedLoginAttempts = 0,
                        LockoutEndUtc = null,
                        MustChangePassword = false,
                        TenantId = defaultTenant.Id,
                        CreatedAtUtc = DateTime.UtcNow,
                        UpdatedAtUtc = DateTime.UtcNow,
                        BranchId = defaultBranch.Id
                    };

                    var tech2 = new User
                    {
                        FullName = "Jane Tech",
                        Email = "jane.tech@repairmanagement.local",
                        PasswordHash = passwordHasher.Hash("TechPassword123!"),
                        Role = Role.Technician,
                        IsActive = true,
                        FailedLoginAttempts = 0,
                        LockoutEndUtc = null,
                        MustChangePassword = false,
                        TenantId = defaultTenant.Id,
                        CreatedAtUtc = DateTime.UtcNow,
                        UpdatedAtUtc = DateTime.UtcNow,
                        BranchId = defaultBranch.Id
                    };

                    dbContext.Users.AddRange(tech1, tech2);
                    await dbContext.SaveChangesAsync();

                    Console.WriteLine("✓ Technician users seeded: john.tech@repairmanagement.local & jane.tech@repairmanagement.local");
                }

                // 5. Self-Healing Migration: Associate any orphan records with the default branch & tenant
                var branchesWithNoTenant = await dbContext.Branches.Where(b => b.TenantId == Guid.Empty).ToListAsync();
                if (branchesWithNoTenant.Any())
                {
                    foreach (var branch in branchesWithNoTenant)
                    {
                        branch.TenantId = defaultTenant.Id;
                    }
                    await dbContext.SaveChangesAsync();
                    Console.WriteLine($"✓ Associated {branchesWithNoTenant.Count} existing branches with default tenant");
                }

                var usersWithNoTenant = await dbContext.Users.Where(u => u.TenantId == Guid.Empty).ToListAsync();
                if (usersWithNoTenant.Any())
                {
                    foreach (var user in usersWithNoTenant)
                    {
                        user.TenantId = defaultTenant.Id;
                    }
                    await dbContext.SaveChangesAsync();
                    Console.WriteLine($"✓ Associated {usersWithNoTenant.Count} existing users with default tenant");
                }

                var usersWithNoBranch = await dbContext.Users.Where(u => u.BranchId == null).ToListAsync();
                if (usersWithNoBranch.Any())
                {
                    foreach (var user in usersWithNoBranch)
                    {
                        user.BranchId = defaultBranch.Id;
                    }
                    await dbContext.SaveChangesAsync();
                    Console.WriteLine($"✓ Associated {usersWithNoBranch.Count} existing users with the default branch");
                }
            }
        }
    }
}
