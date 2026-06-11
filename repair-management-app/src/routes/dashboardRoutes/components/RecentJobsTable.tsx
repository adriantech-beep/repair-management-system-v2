import { Link } from "react-router-dom";
import { Smartphone, ChevronRight, ArrowUpRight, ClipboardList } from "lucide-react";
import type { RecentJob } from "@/types/dashboard";
import { getStatusBg } from "../utils/dashboardHelpers";

interface RecentJobsTableProps {
  recentJobs: RecentJob[];
}

export const RecentJobsTable = ({ recentJobs }: RecentJobsTableProps) => {
  return (
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

      {recentJobs && recentJobs.length > 0 ? (
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
              {recentJobs.map((job) => (
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
  );
};
