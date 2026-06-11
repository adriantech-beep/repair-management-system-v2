import useAuthStore from "@/store/authStore";
import useDashboardStore from "@/store/dashboardStore";
import { useGetDashboardStats, useGetBranches } from "@/hooks/useDashboard";
import { AlertCircle } from "lucide-react";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStatsGrid } from "./components/DashboardStatsGrid";
import { RevenueTrendChart } from "./components/RevenueTrendChart";
import { StatusDistributionChart } from "./components/StatusDistributionChart";
import { RecentJobsTable } from "./components/RecentJobsTable";
import { QuickActions } from "./components/QuickActions";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const isTenantAdmin = user?.branchId === null;

  const { selectedBranchId } = useDashboardStore();

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useGetDashboardStats(selectedBranchId || undefined);

  const { data: branches } = useGetBranches();

  const handleRefresh = () => {
    refetch();
  };

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
      <DashboardHeader
        branches={branches}
        isTenantAdmin={isTenantAdmin}
        isLoading={isLoading}
        isRefetching={isRefetching}
        onRefresh={handleRefresh}
      />

      {isLoading ? (
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
          <DashboardStatsGrid stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <RevenueTrendChart trend={stats.monthlyTrend || []} />
            <StatusDistributionChart statusDistribution={stats.statusDistribution} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentJobsTable recentJobs={stats.recentJobs} />
            <QuickActions topDeviceBrands={stats.topDeviceBrands} />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
