import { Calendar, Building2, RefreshCw, Activity } from "lucide-react";
import useDashboardStore from "@/store/dashboardStore";
import type { Branch } from "@/types/branch";

interface DashboardHeaderProps {
  branches?: Branch[];
  isTenantAdmin: boolean;
  isLoading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
}

export const DashboardHeader = ({
  branches,
  isTenantAdmin,
  isLoading,
  isRefetching,
  onRefresh,
}: DashboardHeaderProps) => {
  const { selectedBranchId, setSelectedBranchId } = useDashboardStore();

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
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
              className="w-full h-11 pl-10 pr-8 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 text-sm font-semibold shadow-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer appearance-none"
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
          onClick={onRefresh}
          disabled={isLoading || isRefetching}
          className="h-11 w-11 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 cursor-pointer shadow-sm hover:scale-102 active:scale-98 transition disabled:opacity-50"
          title="Force refresh statistics"
        >
          <RefreshCw className={`h-4.5 w-4.5 ${isLoading || isRefetching ? "animate-spin text-indigo-500" : ""}`} />
        </button>
      </div>
    </div>
  );
};
