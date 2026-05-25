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
                        UpdatedAtUtc = DateTime.UtcNow
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
                        UpdatedAtUtc = DateTime.UtcNow
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
                        UpdatedAtUtc = DateTime.UtcNow
                    };

                    dbContext.Users.AddRange(tech1, tech2);
                    await dbContext.SaveChangesAsync();

                    Console.WriteLine("✓ Technician users seeded: john.tech@repairmanagement.local & jane.tech@repairmanagement.local");
                }
            }
        }
    }
}
