using System;
using System.Collections.Generic;

namespace RepairManagementApi.DTOs;

public class DashboardStatsDto
{
    public int ActiveRepairsCount { get; set; }
    public int ReadyForPickupCount { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal RevenueChangePercentage { get; set; }
    public int LowStockAlertsCount { get; set; }
    public Dictionary<string, int> StatusDistribution { get; set; } = new();
    public List<RecentJobDto> RecentJobs { get; set; } = new();
    public List<TopDeviceBrandDto> TopDeviceBrands { get; set; } = new();
    public List<MonthlyTrendDto> MonthlyTrend { get; set; } = new();
}

public class RecentJobDto
{
    public Guid Id { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string DeviceModel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}

public class TopDeviceBrandDto
{
    public string Brand { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class MonthlyTrendDto
{
    public string Date { get; set; } = string.Empty;
    public int JobsCount { get; set; }
    public decimal Revenue { get; set; }
}
