import { useGetCustomerById } from "@/hooks/useCustomers";
import { useGetDeviceById } from "@/hooks/useDevices";
import { useGetRepairJobById } from "@/hooks/useRepairJobs";
import { Link, useParams } from "react-router-dom";
import {
  formatCurrency,
  formatDateTime,
  formatOptionalText,
} from "./repairJobFormatters";
import UpdateRepairJobForm from "./UpdateRepairJobForm";
import RepairJobStatusControls from "./RepairJobStatusControls";
import PartsAvailabilitySection from "./PartsAvailabilitySection";
import RepairJobPartsPanel from "./RepairJobPartsPanel";
import useAuthStore from "@/store/authStore";

const RepairJobDetail = () => {
  const { repairJobId = "" } = useParams();
  const user = useAuthStore((state) => state.user);

  const {
    data: repairJob,
    isLoading,
    isError,
    error,
  } = useGetRepairJobById(repairJobId);
  console.log(repairJob?.assignedTechnicianName);

  const { data: customer } = useGetCustomerById(repairJob?.customerId ?? "");
  const { data: device } = useGetDeviceById(repairJob?.deviceId ?? "");

  const normalizedRole = user?.role?.toLowerCase() ?? "";
  const canEditRepairJobDetails = normalizedRole === "admin";

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-emerald-900/70 shadow-sm">
        Loading repair job details...
      </div>
    );
  }

  if (isError) {
    const status = (error as { response?: { status?: number } } | null)
      ?.response?.status;
    const message =
      status === 404
        ? "Repair job not found."
        : status === 403
          ? "You do not have access to this repair job."
          : "Unable to load repair job details.";

    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {message}
      </div>
    );
  }

  if (!repairJob) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            to="/repair-jobs"
            className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
          >
            Back to repair jobs
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-emerald-950">
              {repairJob.jobNumber}
            </h1>
            <p className="text-sm text-emerald-900/60">
              Received {formatDateTime(repairJob.receivedAtUtc)}
            </p>
          </div>
        </div>

        <RepairJobStatusControls repairJob={repairJob} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <article className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-emerald-950">
                Work Summary
              </h2>
              <p className="mt-1 text-sm text-emerald-900/60">
                Timeline-ready layout: this view reserves a dedicated activity
                panel for the future backend timeline endpoint.
              </p>
            </div>

            <section className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
              <div>
                <h3 className="text-sm font-semibold text-emerald-950">
                  Update Repair Job
                </h3>
                {canEditRepairJobDetails ? (
                  <p className="text-xs text-emerald-900/70">
                    Contract-backed update fields for problem details and costs.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-900/70">
                    Detail edits require Admin role.
                  </p>
                )}
              </div>
              {canEditRepairJobDetails && (
                <UpdateRepairJobForm repairJob={repairJob} />
              )}
            </section>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">
                  Customer ID
                </dt>
                <dd className="break-all text-sm text-emerald-950">
                  {repairJob.customerId}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">
                  Device ID
                </dt>
                <dd className="break-all text-sm text-emerald-950">
                  {repairJob.deviceId}
                </dd>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">
                  Problem Description
                </dt>
                <dd className="text-sm text-emerald-950">
                  {repairJob.problemDescription}
                </dd>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">
                  Diagnosis Notes
                </dt>
                <dd className="whitespace-pre-wrap text-sm text-emerald-950">
                  {formatOptionalText(repairJob.diagnosisNotes)}
                </dd>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">
                  Resolution Notes
                </dt>
                <dd className="whitespace-pre-wrap text-sm text-emerald-950">
                  {formatOptionalText(repairJob.resolutionNotes)}
                </dd>
              </div>
            </dl>
          </article>

          <RepairJobPartsPanel
            repairJobId={repairJob.id}
            deviceBrand={device?.brand}
            deviceModel={device?.model}
          />
        </div>

        <div className="space-y-4 font-normal">
          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-emerald-950">
              Costs and Dates
            </h2>

            <dl className="mt-4 space-y-4">
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">
                  Estimated Cost
                </dt>
                <dd className="text-sm text-emerald-950">
                  {formatCurrency(repairJob.estimatedCost)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">
                  Final Cost
                </dt>
                <dd className="text-sm text-emerald-950">
                  {formatCurrency(repairJob.finalCost)}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">
                  Assigned Technician
                </dt>
                <dd className="text-sm font-medium text-emerald-950">
                  {repairJob.assignedTechnicianName || "Unassigned"}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">
                  Completed At
                </dt>
                <dd className="text-sm text-emerald-950">
                  {formatDateTime(repairJob.completedAtUtc)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">
                  Last Updated
                </dt>
                <dd className="text-sm text-emerald-950">
                  {formatDateTime(repairJob.updatedAtUtc)}
                </dd>
              </div>
            </dl>
          </section>

          <PartsAvailabilitySection
            repairJob={repairJob}
            customer={customer}
            device={device}
          />
        </div>
      </div>
    </section>
  );
};

export default RepairJobDetail;
