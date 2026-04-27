using System.Reflection.Metadata;
using System.Runtime.InteropServices.Marshalling;
using System.Security.AccessControl;
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
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Customer> Customers => Set<Customer>();

    public DbSet<Device> Devices => Set<Device>();

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

            entity.HasIndex(u => u.BranchId);
            
            entity.HasOne(u => u.Branch)
            .WithMany(b => b.Users)
            .HasForeignKey(u => u.BranchId)
            .OnDelete(DeleteBehavior.    Restrict);   
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

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(b => b.Id);

            entity.Property(b => b.Code)
                .IsRequired()
                .HasMaxLength(20);

            entity.HasIndex(b => b.Code)
                .IsUnique();

            entity.Property(b => b.Name)
                .IsRequired()
                .HasMaxLength(120);

            entity.HasIndex(b => b.Name)
                .IsUnique();

            entity.Property(b => b.Address)
                .HasMaxLength(300);

            entity.Property(b => b.CreatedAtUtc)
                .IsRequired();

            entity.Property(b => b.UpdatedAtUtc)
                .IsRequired();
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
    modelBuilder.Entity<Customer>(entity =>
    {
        entity.HasKey(c => c.Id);
        entity.Property(c => c.FullName)
            .IsRequired()
            .HasMaxLength(100);
        entity.Property(c => c.Phone)
            .IsRequired()  
            .HasMaxLength(20);
        entity.Property(c => c.Email)
            .HasMaxLength(256);
        entity.Property(c => c.Address)
            .HasMaxLength(300);
        entity.HasIndex(c => c.BranchId);
        entity.HasOne(c => c.Branch)
            .WithMany(b => b.Customers)
            .HasForeignKey(c => c.BranchId)
            .OnDelete(DeleteBehavior.Restrict);
    
    
});


    modelBuilder.Entity<Device>(entity =>
    {
        entity.HasKey(d => d.Id);
        entity.Property(d => d.Brand).IsRequired().HasMaxLength(50);
        entity.Property(d => d.Model).IsRequired().HasMaxLength(100);
        entity.Property(d => d.SerialNumber).HasMaxLength(100);
        entity.Property(d => d.DeviceType).IsRequired()
        .HasConversion<string>();
        entity.Property(d => d.CreatedAtUtc).IsRequired();
        entity.Property(d => d.UpdatedAtUtc).IsRequired();

        entity.HasIndex(d => d.CustomerId);
        entity.HasIndex(d => d.BranchId);

        entity.HasOne(d => d.Customer)
        .WithMany()
        .HasForeignKey(d => d.CustomerId)
        .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(d => d.Branch)
        .WithMany()
        .HasForeignKey(d => d.BranchId)
        .OnDelete(DeleteBehavior.Restrict);
});
    
    
    
    }
}