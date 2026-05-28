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

                // Seed default Branch if none exists
                var defaultBranch = await dbContext.Branches.FirstOrDefaultAsync();
                if (defaultBranch is null)
                {
                    defaultBranch = new Branch
                    {
                        Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                        Code = "MAIN",
                        Name = "Main Branch",
                        Address = "123 Main Street",
                        CreatedAtUtc = DateTime.UtcNow,
                        UpdatedAtUtc = DateTime.UtcNow
                    };
                    dbContext.Branches.Add(defaultBranch);
                    await dbContext.SaveChangesAsync();
                    Console.WriteLine("✓ Default branch seeded: Main Branch");
                }

                // Seed Admin user if none exists
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
                        CreatedAtUtc = DateTime.UtcNow,
                        UpdatedAtUtc = DateTime.UtcNow,
                        BranchId = defaultBranch.Id
                    };

                    dbContext.Users.Add(adminUser);
                    await dbContext.SaveChangesAsync();

                    Console.WriteLine("✓ Admin user seeded: admin@repairmanagement.local / AdminPassword123!");
                }

                // Seed Technician users if none exist
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
                        CreatedAtUtc = DateTime.UtcNow,
                        UpdatedAtUtc = DateTime.UtcNow,
                        BranchId = defaultBranch.Id
                    };

                    dbContext.Users.AddRange(tech1, tech2);
                    await dbContext.SaveChangesAsync();

                    Console.WriteLine("✓ Technician users seeded: john.tech@repairmanagement.local & jane.tech@repairmanagement.local");
                }

                // Associate any existing users with no branch to the default branch (self-healing migration)
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
