using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;
using RepairManagementApi.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RepairManagementApi.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IBranchContext _branchContext;

    public DashboardController(AppDbContext dbContext, IBranchContext branchContext)
    {
        _dbContext = dbContext;
        _branchContext = branchContext;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats([FromQuery] Guid? branchId)
    {
        // Enforce branch locking security: non-TenantAdmins are restricted to their branchContext
        Guid? targetBranchId = _branchContext.BranchId.HasValue 
            ? _branchContext.BranchId.Value 
            : branchId;

        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfMonth = startOfMonth.AddMonths(1);

        // 1. KPI Counts
        var activeRepairsCount = await _dbContext.RepairJobs
            .Where(rj => (targetBranchId == null || rj.BranchId == targetBranchId) &&
                         (rj.Status == RepairJobStatus.Received ||
                          rj.Status == RepairJobStatus.Diagnosing ||
                          rj.Status == RepairJobStatus.Repairing))
            .CountAsync();

        var readyForPickupCount = await _dbContext.RepairJobs
            .Where(rj => (targetBranchId == null || rj.BranchId == targetBranchId) &&
                         rj.Status == RepairJobStatus.ReadyForPickup)
            .CountAsync();

        var monthlyRevenue = await _dbContext.RepairJobs
            .Where(rj => (targetBranchId == null || rj.BranchId == targetBranchId) &&
                         rj.Status == RepairJobStatus.Completed &&
                         rj.CompletedAtUtc >= startOfMonth &&
                         rj.CompletedAtUtc < endOfMonth)
            .SumAsync(rj => rj.FinalCost ?? 0);

        // 2. Previous Month Revenue comparison
        var startOfLastMonth = startOfMonth.AddMonths(-1);
        var endOfLastMonth = startOfMonth;

        var lastMonthRevenue = await _dbContext.RepairJobs
            .Where(rj => (targetBranchId == null || rj.BranchId == targetBranchId) &&
                         rj.Status == RepairJobStatus.Completed &&
                         rj.CompletedAtUtc >= startOfLastMonth &&
                         rj.CompletedAtUtc < endOfLastMonth)
            .SumAsync(rj => rj.FinalCost ?? 0);

        decimal revenueChangePercentage = 0;
        if (lastMonthRevenue > 0)
        {
            revenueChangePercentage = ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        }
        else if (monthlyRevenue > 0)
        {
            revenueChangePercentage = 100;
        }

        var lowStockAlertsCount = await _dbContext.Parts
            .Where(p => p.StockQuantity < 5)
            .CountAsync();

        // 3. Status Distribution
        var statusCounts = await _dbContext.RepairJobs
            .Where(rj => targetBranchId == null || rj.BranchId == targetBranchId)
            .GroupBy(rj => rj.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var statusDistribution = Enum.GetValues<RepairJobStatus>()
            .ToDictionary(s => s.ToString(), _ => 0);

        foreach (var sc in statusCounts)
        {
            statusDistribution[sc.Status.ToString()] = sc.Count;
        }

        // 4. Recent Jobs
        var recentJobs = await _dbContext.RepairJobs
            .Where(rj => targetBranchId == null || rj.BranchId == targetBranchId)
            .OrderByDescending(rj => rj.CreatedAtUtc)
            .Take(5)
            .Select(rj => new RecentJobDto
            {
                Id = rj.Id,
                JobNumber = rj.JobNumber,
                CustomerName = rj.Customer != null ? rj.Customer.FullName : "Unknown",
                DeviceModel = rj.Device != null ? $"{rj.Device.Brand} {rj.Device.Model}" : "Unknown",
                Status = rj.Status.ToString(),
                CreatedAtUtc = rj.CreatedAtUtc
            })
            .ToListAsync();

        // 5. Top Device Brands
        var topDeviceBrands = await _dbContext.Devices
            .Where(d => targetBranchId == null || d.BranchId == targetBranchId)
            .GroupBy(d => d.Brand)
            .OrderByDescending(g => g.Count())
            .Take(5)
            .Select(g => new TopDeviceBrandDto
            {
                Brand = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        // 6. Trend data (last 7 days)
        var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
        var startOfTrend = DateTime.SpecifyKind(sevenDaysAgo, DateTimeKind.Utc);

        var jobsInPeriod = await _dbContext.RepairJobs
            .Where(rj => (targetBranchId == null || rj.BranchId == targetBranchId) &&
                         (rj.CreatedAtUtc >= startOfTrend || rj.CompletedAtUtc >= startOfTrend))
            .ToListAsync();

        var trendList = new List<MonthlyTrendDto>();
        for (int i = 6; i >= 0; i--)
        {
            var date = DateTime.UtcNow.Date.AddDays(-i);
            var startOfDay = DateTime.SpecifyKind(date, DateTimeKind.Utc);
            var endOfDay = startOfDay.AddDays(1);

            var jobsCount = jobsInPeriod.Count(rj => rj.CreatedAtUtc >= startOfDay && rj.CreatedAtUtc < endOfDay);
            var revenue = jobsInPeriod
                .Where(rj => rj.Status == RepairJobStatus.Completed && 
                             rj.CompletedAtUtc >= startOfDay && 
                             rj.CompletedAtUtc < endOfDay)
                .Sum(rj => rj.FinalCost ?? 0);

            trendList.Add(new MonthlyTrendDto
            {
                Date = date.ToString("yyyy-MM-dd"),
                JobsCount = jobsCount,
                Revenue = revenue
            });
        }

        var dto = new DashboardStatsDto
        {
            ActiveRepairsCount = activeRepairsCount,
            ReadyForPickupCount = readyForPickupCount,
            MonthlyRevenue = monthlyRevenue,
            RevenueChangePercentage = revenueChangePercentage,
            LowStockAlertsCount = lowStockAlertsCount,
            StatusDistribution = statusDistribution,
            RecentJobs = recentJobs,
            TopDeviceBrands = topDeviceBrands,
            MonthlyTrend = trendList
        };

        return Ok(dto);
    }
}
