export interface RecentJob {
  id: string;
  jobNumber: string;
  customerName: string;
  deviceModel: string;
  status: string;
  createdAtUtc: string;
}

export interface TopDeviceBrand {
  brand: string;
  count: number;
}

export interface MonthlyTrend {
  date: string;
  jobsCount: number;
  revenue: number;
}

export interface DashboardStats {
  activeRepairsCount: number;
  readyForPickupCount: number;
  monthlyRevenue: number;
  revenueChangePercentage: number;
  lowStockAlertsCount: number;
  statusDistribution: Record<string, number>;
  recentJobs: RecentJob[];
  topDeviceBrands: TopDeviceBrand[];
  monthlyTrend: MonthlyTrend[];
}
