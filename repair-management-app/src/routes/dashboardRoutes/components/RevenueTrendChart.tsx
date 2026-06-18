import type { MonthlyTrend } from "@/types/dashboard";

interface RevenueTrendChartProps {
  trend: MonthlyTrend[];
}

export const RevenueTrendChart = ({ trend }: RevenueTrendChartProps) => {
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

  return (
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


      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto text-indigo-500">
          <defs>
            <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
            </linearGradient>
          </defs>


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


          <line
            x1={paddingLeft}
            y1={chartHeight - paddingBottom}
            x2={chartWidth - paddingRight}
            y2={chartHeight - paddingBottom}
            stroke="rgba(148, 163, 184, 0.2)"
          />


          {revenueAreaPath && (
            <path d={revenueAreaPath} fill="url(#revenue-gradient)" />
          )}


          {revenueLinePath && (
            <path
              d={revenueLinePath}
              fill="transparent"
              stroke="rgb(99, 102, 241)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}


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

              <title>{`Date: ${p.date}\nRevenue: $${p.revenue.toFixed(2)}\nIntakes: ${p.jobs} jobs`}</title>
            </g>
          ))}


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


      <div className="flex gap-4 justify-end mt-4 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 pr-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-1 border-t-2 border-dashed border-amber-500" /> Jobs Registered
        </span>
      </div>
    </div>
  );
};
