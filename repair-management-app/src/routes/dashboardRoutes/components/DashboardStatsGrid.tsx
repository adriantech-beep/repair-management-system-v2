import { Wrench, CheckCircle2, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";

interface DashboardStatsGridProps {
  stats: DashboardStats;
}

export const DashboardStatsGrid = ({ stats }: DashboardStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

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
  );
};
