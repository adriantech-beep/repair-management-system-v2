import { useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { useGetDashboardStats, useGetBranches } from "@/hooks/useDashboard";
import {
  Wrench,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Plus,
  ListTodo,
  Calendar,
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ChevronRight,
  ClipboardList
} from "lucide-react";

// Helper for status colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "received":
      return "#3b82f6"; // Blue
    case "diagnosing":
      return "#f59e0b"; // Amber
    case "repairing":
      return "#a855f7"; // Purple
    case "readyforpickup":
      return "#10b981"; // Emerald
    case "completed":
      return "#14b8a6"; // Teal
    case "cancelled":
      return "#ef4444"; // Red
    default:
      return "#64748b"; // Slate
  }
};

const getStatusBg = (status: string) => {
  switch (status.toLowerCase()) {
    case "received":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "diagnosing":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "repairing":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "readyforpickup":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "completed":
      return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  }
};

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const isTenantAdmin = user?.branchId === null;

  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  // React Query Stats Hooks
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useGetDashboardStats(selectedBranchId || undefined);

  const { data: branches } = useGetBranches();

  // Compute trend data calculations if loaded
  const trend = stats?.monthlyTrend || [];
  const maxRevenue = Math.max(...trend.map((t) => t.revenue), 100);
  const maxJobs = Math.max(...trend.map((t) => t.jobsCount), 5);

  const chartWidth = 500;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const revenuePoints = trend.map((t, idx) => {
    const x = paddingLeft + (idx / Math.max(trend.length - 1, 1)) * graphWidth;
    const y = chartHeight - paddingBottom - (t.revenue / maxRevenue) * graphHeight;
    return { x, y, date: t.date, revenue: t.revenue, jobs: t.jobsCount };
  });

  const jobsPoints = trend.map((t, idx) => {
    const x = paddingLeft + (idx / Math.max(trend.length - 1, 1)) * graphWidth;
    const y = chartHeight - paddingBottom - (t.jobsCount / maxJobs) * graphHeight;
    return { x, y };
  });

  const revenueLinePath = revenuePoints.length > 0
    ? `M ${revenuePoints[0].x} ${revenuePoints[0].y} ` + revenuePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const revenueAreaPath = revenuePoints.length > 0
    ? `${revenueLinePath} L ${revenuePoints[revenuePoints.length - 1].x} ${chartHeight - paddingBottom} L ${revenuePoints[0].x} ${chartHeight - paddingBottom} Z`
    : "";

  const jobsLinePath = jobsPoints.length > 0
    ? `M ${jobsPoints[0].x} ${jobsPoints[0].y} ` + jobsPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  // Segment calculation for Doughnut Chart
  const totalJobs = stats ? Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0) : 0;
  let accumulatedOffset = 0;

  const segments = stats
    ? Object.entries(stats.statusDistribution)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => {
        const percent = totalJobs > 0 ? (count / totalJobs) * 100 : 0;
        const strokeLength = (percent / 100) * 314.16;
        const currentOffset = accumulatedOffset;
        accumulatedOffset += strokeLength;
        return {
          status,
          count,
          percent,
          strokeLength,
          strokeOffset: -currentOffset,
        };
      })
    : [];

  const handleRefresh = () => {
    refetch();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto mt-12 p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-50">Failed to Load Dashboard Stats</h3>
        <p className="text-slate-500 dark:text-zinc-400 mt-1">
          Please check your network connection or verify your session.
        </p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-900 dark:text-zinc-100 min-h-screen">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-pulse" /> Operations Dashboard
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1.5 text-sm flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" /> {currentDate}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Branch Selector for Tenant Admin */}
          {isTenantAdmin && branches && branches.length > 0 && (
            <div className="relative flex items-center shrink-0 min-w-[180px]">
              <Building2 className="absolute left-3.5 h-4.5 w-4.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full h-11 pl-10 pr-8 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm font-semibold shadow-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer appearance-none"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400" />
            </div>
          )}

          {/* Sync Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className="h-11 w-11 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 cursor-pointer shadow-sm hover:scale-102 active:scale-98 transition disabled:opacity-50"
            title="Force refresh statistics"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${isLoading || isRefetching ? "animate-spin text-indigo-500" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        // Loading Skeleton UI
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-3xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-800/80" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 rounded-3xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-800/80" />
            <div className="h-96 rounded-3xl bg-white/40 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-800/80" />
          </div>
        </div>
      ) : stats ? (
        <>
          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Repairs */}
            <div className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 flex items-center justify-between group hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-0.5">
                  Active Repairs
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-zinc-50">
                    {stats.activeRepairsCount}
                  </h3>
                  {stats.activeRepairsCount > 0 && (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                <Wrench className="h-6 w-6 stroke-[1.5]" />
              </div>
            </div>

            {/* Ready for Pickup */}
            <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 flex items-center justify-between group hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-300">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-0.5">
                  Ready for Pickup
                </p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-zinc-50">
                  {stats.readyForPickupCount}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                <CheckCircle2 className="h-6 w-6 stroke-[1.5]" />
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 flex items-center justify-between group hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-0.5">
                  Monthly Revenue
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-zinc-50">
                    ${stats.monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
                <p className={`text-[10px] font-semibold flex items-center gap-0.5 ${stats.revenueChangePercentage >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                  <TrendingUp className="h-3 w-3" /> {stats.revenueChangePercentage >= 0 ? "+" : ""}{stats.revenueChangePercentage.toFixed(1)}% vs last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                <DollarSign className="h-6 w-6 stroke-[1.5]" />
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className={`bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md border shadow-sm rounded-3xl p-6 flex items-center justify-between group transition-all duration-300 ${stats.lowStockAlertsCount > 0
              ? "bg-gradient-to-br from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10 border-rose-500/30 dark:border-rose-500/30"
              : "border-slate-200/50 dark:border-zinc-800/80 hover:border-zinc-500/20"
              }`}>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-0.5">
                  Low Stock Parts
                </p>
                <h3 className={`text-3xl font-black ${stats.lowStockAlertsCount > 0 ? "text-rose-600 dark:text-rose-450" : "text-slate-900 dark:text-zinc-50"}`}>
                  {stats.lowStockAlertsCount}
                </h3>
              </div>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${stats.lowStockAlertsCount > 0
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-bounce"
                : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                }`}>
                <AlertTriangle className="h-6 w-6 stroke-[1.5]" />
              </div>
            </div>
          </div>

          {/* Charts & Diagnostics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Area Trend Chart */}
            <div className="lg:col-span-2 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">
                    Revenue & Repair Trends
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Daily sales and job intakes for the last 7 days
                  </p>
                </div>
              </div>

              {/* Render Area Chart Path in responsive SVG */}
              <div className="w-full overflow-hidden">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto text-indigo-500">
                  <defs>
                    <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                    const y = chartHeight - paddingBottom - val * graphHeight;
                    const labelVal = Math.round(val * maxRevenue);
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={chartWidth - paddingRight}
                          y2={y}
                          stroke="rgba(148, 163, 184, 0.12)"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingLeft - 10}
                          y={y + 3.5}
                          fill="currentColor"
                          className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold"
                          textAnchor="end"
                        >
                          ${labelVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* X Axis Line */}
                  <line
                    x1={paddingLeft}
                    y1={chartHeight - paddingBottom}
                    x2={chartWidth - paddingRight}
                    y2={chartHeight - paddingBottom}
                    stroke="rgba(148, 163, 184, 0.2)"
                  />

                  {/* Revenue Area Fill */}
                  {revenueAreaPath && (
                    <path d={revenueAreaPath} fill="url(#revenue-gradient)" />
                  )}

                  {/* Revenue Line */}
                  {revenueLinePath && (
                    <path
                      d={revenueLinePath}
                      fill="transparent"
                      stroke="rgb(99, 102, 241)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Jobs Intake Line (Dashed Orange) */}
                  {jobsLinePath && (
                    <path
                      d={jobsLinePath}
                      fill="transparent"
                      stroke="rgb(245, 158, 11)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Data Point Dot Markers */}
                  {revenuePoints.map((p, idx) => (
                    <g key={idx} className="group/dot cursor-pointer">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill="rgb(99, 102, 241)"
                        stroke="white"
                        strokeWidth="1.5"
                        className="transition-transform duration-200 group-hover/dot:scale-125 shadow-sm"
                      />
                      {/* Tooltip detail overlay inside SVG on point hover */}
                      <title>{`Date: ${p.date}\nRevenue: $${p.revenue.toFixed(2)}\nIntakes: ${p.jobs} jobs`}</title>
                    </g>
                  ))}

                  {/* Date labels on X-axis */}
                  {revenuePoints.map((p, idx) => {
                    const dateObj = new Date(p.date);
                    const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    return (
                      <text
                        key={idx}
                        x={p.x}
                        y={chartHeight - 10}
                        fill="currentColor"
                        className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold"
                        textAnchor="middle"
                      >
                        {formattedDate}
                      </text>
                    );
                  })}
                </svg>
              </div>

              {/* Legend Indicator */}
              <div className="flex gap-4 justify-end mt-4 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 pr-2">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-1 border-t-2 border-dashed border-amber-500" /> Jobs Registered
                </span>
              </div>
            </div>

            {/* Doughnut Chart - Status Distribution */}
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 flex flex-col items-center justify-between text-center relative">
              <div className="w-full text-left mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">
                  Status Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Total load segments by status
                </p>
              </div>

              {totalJobs > 0 ? (
                <div className="relative flex items-center justify-center h-40 w-40 my-2 shrink-0">
                  <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                    {segments.map((seg) => (
                      <circle
                        key={seg.status}
                        cx="70"
                        cy="70"
                        r="50"
                        fill="transparent"
                        stroke={getStatusColor(seg.status)}
                        strokeWidth="12"
                        strokeDasharray={`${seg.strokeLength} 314.16`}
                        strokeDashoffset={seg.strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 hover:stroke-[15px] cursor-pointer"
                      >
                        <title>{`${seg.status}: ${seg.count} (${seg.percent.toFixed(1)}%)`}</title>
                      </circle>
                    ))}
                  </svg>
                  {/* Center Text inside Circle */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">
                      {totalJobs}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                      Total Jobs
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-grow py-8 text-slate-400 dark:text-zinc-500">
                  <Smartphone className="h-16 w-16 stroke-[1.2] mb-3 text-slate-300 dark:text-zinc-800" />
                  <span className="text-xs font-semibold">No active jobs found for context</span>
                </div>
              )}

              {/* Status Segment Labels grid */}
              <div className="grid grid-cols-2 w-full gap-2 text-left text-xs font-medium text-slate-500 dark:text-zinc-400 mt-4">
                {Object.entries(stats.statusDistribution).map(([status, count]) => {
                  const color = getStatusColor(status);
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="truncate">{status}</span>
                      <span className="text-slate-400 font-bold text-[11px] ml-auto">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity Repair Jobs Table */}
            <div className="lg:col-span-2 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-5 shrink-0">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">
                    Recent Repair Orders
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Latest five repair tickets generated
                  </p>
                </div>
                <Link
                  to="/repair-jobs"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {stats.recentJobs && stats.recentJobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500 dark:text-zinc-400">
                    <thead className="text-xs uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider border-b border-slate-100 dark:border-zinc-800">
                      <tr>
                        <th className="pb-3 pl-2">Job Number</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Device Model</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                      {stats.recentJobs.map((job) => (
                        <tr key={job.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-950/20">
                          <td className="py-3.5 pl-2 font-semibold text-slate-900 dark:text-zinc-150">
                            {job.jobNumber}
                          </td>
                          <td className="py-3.5">{job.customerName}</td>
                          <td className="py-3.5 flex items-center gap-2">
                            <Smartphone className="h-4.5 w-4.5 text-slate-400" />
                            <span>{job.deviceModel}</span>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBg(job.status)}`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3.5 pr-2 text-right">
                            <Link
                              to={`/repair-jobs/${job.id}`}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              Details <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-grow py-12 text-slate-400 dark:text-zinc-500">
                  <ClipboardList className="h-14 w-14 text-slate-350 dark:text-zinc-850 stroke-[1.2] mb-3" />
                  <span className="text-xs font-semibold">No repair tickets generated yet.</span>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
              <div className="w-full">
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50 mb-1">
                  Quick Actions
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">
                  Frequent operations shortcuts
                </p>

                <div className="space-y-4">
                  {/* Create Service Order Wizard */}
                  <Link
                    to="/service-orders/new"
                    className="flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/45 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <ListTodo className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300">
                          Intake Service Order
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Launch repair wizard
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-indigo-400 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  {/* Register Customer */}
                  <Link
                    to="/customers"
                    className="flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300">
                          Register Customer
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Add new client details
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-emerald-400 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  {/* Manage Inventory */}
                  <Link
                    to="/inventory"
                    className="flex items-center justify-between p-4 bg-slate-100/40 dark:bg-zinc-800/10 hover:bg-slate-100/80 dark:hover:bg-zinc-800/20 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-zinc-400 flex items-center justify-center">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-300">
                          Manage Inventory
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Restock & configure parts
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Top repaired brand statistics */}
              <div className="mt-8 border-t border-slate-100 dark:border-zinc-850 pt-4 w-full text-left">
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-0.5 mb-3">
                  Top Device Brands
                </h4>
                {stats.topDeviceBrands && stats.topDeviceBrands.length > 0 ? (
                  <div className="space-y-2.5">
                    {stats.topDeviceBrands.map((b) => {
                      const totalBrandsCount = stats.topDeviceBrands.reduce((acc, curr) => acc + curr.count, 0);
                      const barPercent = totalBrandsCount > 0 ? (b.count / totalBrandsCount) * 100 : 0;
                      return (
                        <div key={b.brand} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-zinc-350 px-0.5">
                            <span>{b.brand}</span>
                            <span className="text-[11px] text-slate-400">{b.count} jobs</span>
                          </div>
                          {/* Custom visual progress bar bar */}
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-500"
                              style={{ width: `${barPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-zinc-500">No device logs available</span>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
