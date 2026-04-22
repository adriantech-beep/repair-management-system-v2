using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Models;

namespace RepairManagementApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<Part> Parts => Set<Part>();
    public DbSet<PartCompatibility> PartCompatibilities => Set<PartCompatibility>();
    public DbSet<PartWaitlistRequest> PartWaitlistRequests => Set<PartWaitlistRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.Property(u => u.FullName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(256);

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.PasswordHash)
                .IsRequired();

            entity.Property(u => u.Role)
                .IsRequired()
                .HasConversion<string>();
        });

        // RefreshToken configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(r => r.Id);

            entity.Property(r => r.TokenHash)
                .IsRequired();

            entity.HasIndex(r => r.TokenHash)
                .IsUnique();

            entity.HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        modelBuilder.Entity<Part>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.Property(p => p.PartNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(p => p.PartNumber)
                .IsUnique();

            entity.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(120);

            entity.Property(p => p.Category)
                .IsRequired()
                .HasMaxLength(60);

            entity.Property(p => p.StockQuantity)
                .IsRequired();

            entity.Property(p => p.SupplierPrice)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            entity.Property(p => p.SellingPrice)
                .IsRequired()
                .HasColumnType("decimal(18,2)");
    
    });


    modelBuilder.Entity<PartCompatibility>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Brand)
                .IsRequired()
                .HasMaxLength(60);

            entity.Property(c => c.ModelName)
                .IsRequired()
                .HasMaxLength(80);

            entity.HasIndex(c => new { c.PartId, c.Brand, c.ModelName })
                .IsUnique();

            entity.HasOne(c => c.Part)
                .WithMany(p => p.Compatibilities)
                .HasForeignKey(c => c.PartId)
                .OnDelete(DeleteBehavior.Cascade);
});

    modelBuilder.Entity<PartWaitlistRequest>(entity =>
        {
            entity.HasKey(w => w.Id);

            entity.Property(w => w.CustomerName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(w => w.CustomerEmail)
                .HasMaxLength(256);

            entity.Property(w => w.CustomerPhone)
                .HasMaxLength(20);

            entity.Property(w => w.PreferredContactMethod)
                .IsRequired()
                .HasConversion<string>();

            entity.Property(w => w.Status)
                .IsRequired()
                .HasConversion<string>();

            entity.Property(w => w.Notes)
                .HasMaxLength(500);

            entity.HasOne(w => w.Part)
                .WithMany(p => p.WaitlistRequests)
                .HasForeignKey(w => w.PartId)
                .OnDelete(DeleteBehavior.Cascade);
});
    }
}