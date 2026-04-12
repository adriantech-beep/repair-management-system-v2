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
            }
        }
    }
}
