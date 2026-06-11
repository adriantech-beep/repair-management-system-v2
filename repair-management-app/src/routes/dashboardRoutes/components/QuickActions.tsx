import { Link } from "react-router-dom";
import { ChevronRight, ListTodo, Plus, Wrench } from "lucide-react";
import type { TopDeviceBrand } from "@/types/dashboard";

interface QuickActionsProps {
  topDeviceBrands: TopDeviceBrand[];
}

export const QuickActions = ({ topDeviceBrands }: QuickActionsProps) => {
  return (
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
                <h4 className="text-xs font-bold text-indigo-955 dark:text-indigo-300">
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
                <h4 className="text-xs font-bold text-emerald-955 dark:text-emerald-300">
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
        {topDeviceBrands && topDeviceBrands.length > 0 ? (
          <div className="space-y-2.5">
            {topDeviceBrands.map((b) => {
              const totalBrandsCount = topDeviceBrands.reduce((acc, curr) => acc + curr.count, 0);
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
  );
};
