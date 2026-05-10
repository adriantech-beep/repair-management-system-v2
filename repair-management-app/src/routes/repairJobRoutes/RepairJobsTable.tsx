import TypedTable from "@/context/Table";
import { useGetRepairJobs } from "@/hooks/useRepairJobs";
import { repairJobStatuses, type RepairJobStatus } from "@/types/repairJob";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  formatCurrency,
  formatDateTime,
  formatRepairJobStatus,
  repairJobStatusClasses,
} from "./repairJobFormatters";

const filterOptions: Array<{ label: string; value: RepairJobStatus | "all" }> =
  [
    { label: "All statuses", value: "all" },
    ...repairJobStatuses.map((status) => ({
      label: formatRepairJobStatus(status),
      value: status,
    })),
  ];

const RepairJobsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedStatus = searchParams.get("status");
  const activeStatus = repairJobStatuses.includes(
    selectedStatus as RepairJobStatus,
  )
    ? (selectedStatus as RepairJobStatus)
    : undefined;

  const {
    data: repairJobs = [],
    isLoading,
    isError,
  } = useGetRepairJobs(activeStatus);

  const emptyMessage = useMemo(() => {
    if (activeStatus) {
      return "No repair jobs match the selected status.";
    }

    return "No repair jobs have been created for this branch yet.";
  }, [activeStatus]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-emerald-900/70 shadow-sm">
        Loading repair jobs...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        Unable to load repair jobs.
      </div>
    );
  }

  return (
    <section className="space-y-4 border border-emerald-100/70 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-emerald-950">
            Repair Jobs
          </h2>
          <p className="text-sm text-emerald-900/60">
            {repairJobs.length} shown
            {activeStatus ? " for selected status" : ""}
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-emerald-950 sm:items-end">
          <span>Status filter</span>
          <select
            aria-label="Filter repair jobs by status"
            className="h-10 min-w-52 rounded-md border border-emerald-200 bg-white px-3 text-sm shadow-sm outline-none ring-0 transition focus:border-emerald-500"
            value={activeStatus ?? "all"}
            onChange={(event) => {
              const nextStatus = event.target.value;
              const nextParams = new URLSearchParams(searchParams);

              if (nextStatus === "all") {
                nextParams.delete("status");
              } else {
                nextParams.set("status", nextStatus);
              }

              setSearchParams(nextParams);
            }}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {repairJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-sm text-emerald-900/70">
          {emptyMessage}
        </div>
      ) : (
        <TypedTable columns="1fr 2.1fr 1fr 1fr auto">
          <TypedTable.Header>
            <div>Job Number</div>
            <div>Problem</div>
            <div>Status</div>
            <div>Estimated Cost</div>
            <div className="text-right">Details</div>
          </TypedTable.Header>

          <TypedTable.Body
            data={repairJobs}
            render={(repairJob) => (
              <TypedTable.Row key={repairJob.id}>
                <div className="space-y-1">
                  <p className="font-medium text-emerald-950">
                    {repairJob.jobNumber}
                  </p>
                  <p className="text-xs text-emerald-900/60">
                    Received {formatDateTime(repairJob.receivedAtUtc)}
                  </p>
                </div>

                <p className="line-clamp-2 text-sm text-emerald-950">
                  {repairJob.problemDescription}
                </p>

                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${repairJobStatusClasses[repairJob.status]}`}
                  >
                    {formatRepairJobStatus(repairJob.status)}
                  </span>
                </div>

                <p className="text-sm text-emerald-950">
                  {formatCurrency(repairJob.estimatedCost)}
                </p>

                <div className="text-right">
                  <Link
                    to={`/repair-jobs/${repairJob.id}`}
                    className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
                  >
                    Open
                  </Link>
                </div>
              </TypedTable.Row>
            )}
          />
        </TypedTable>
      )}
    </section>
  );
};

export default RepairJobsTable;
