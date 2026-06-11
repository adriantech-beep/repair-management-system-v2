import { Smartphone } from "lucide-react";
import { getStatusColor } from "../utils/dashboardHelpers";

interface StatusDistributionChartProps {
  statusDistribution: Record<string, number>;
}

export const StatusDistributionChart = ({ statusDistribution }: StatusDistributionChartProps) => {
  const totalJobs = statusDistribution ? Object.values(statusDistribution).reduce((a, b) => a + b, 0) : 0;
  let accumulatedOffset = 0;

  const segments = statusDistribution
    ? Object.entries(statusDistribution)
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

  return (
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
        {Object.entries(statusDistribution).map(([status, count]) => {
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
  );
};
