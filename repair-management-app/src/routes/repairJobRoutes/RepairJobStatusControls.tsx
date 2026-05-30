import type { RepairJobResponse, RepairJobStatus } from "@/types/repairJob";
import { repairJobStatuses } from "@/types/repairJob";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import { useUpdateRepairJobStatus } from "@/hooks/useRepairJobs";
import parseApiError from "@/api/parseApiError";
import {
  formatRepairJobStatus,
  repairJobStatusClasses,
} from "./repairJobFormatters";

interface RepairJobStatusControlsProps {
  repairJob: RepairJobResponse;
}

const RepairJobStatusControls = ({ repairJob }: RepairJobStatusControlsProps) => {
  const user = useAuthStore((state) => state.user);
  const {
    mutateAsync: updateRepairJobStatus,
    isPending: isUpdatingRepairJobStatus,
  } = useUpdateRepairJobStatus();

  const [statusDraft, setStatusDraft] = useState<RepairJobStatus>("Received");
  const [statusError, setStatusError] = useState<string | null>(null);

  const normalizedRole = user?.role?.toLowerCase() ?? "";
  const canUpdateRepairJobStatus =
    normalizedRole === "admin" || normalizedRole === "technician";

  useEffect(() => {
    if (repairJob) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatusDraft(repairJob.status);
    }
  }, [repairJob]);

  const submitStatusUpdate = async () => {
    if (!canUpdateRepairJobStatus || isUpdatingRepairJobStatus) return;

    try {
      setStatusError(null);

      await updateRepairJobStatus({
        repairJobId: repairJob.id,
        payload: { status: statusDraft },
      });
    } catch (submitError) {
      const parsed = parseApiError(submitError);
      setStatusError(parsed.message || "Unable to update repair job status.");
    }
  };

  return (
    <div className="space-y-2">
      <span
        className={`inline-flex self-start rounded-full px-3 py-1 text-sm font-medium ${repairJobStatusClasses[repairJob.status]}`}
      >
        {formatRepairJobStatus(repairJob.status)}
      </span>

      {canUpdateRepairJobStatus ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            aria-label="Update repair job status"
            className="h-9 rounded-md border border-emerald-200 bg-white px-3 text-sm"
            value={statusDraft}
            onChange={(event) =>
              setStatusDraft(event.target.value as RepairJobStatus)
            }
            disabled={isUpdatingRepairJobStatus}
          >
            {repairJobStatuses.map((status) => (
              <option key={status} value={status}>
                {formatRepairJobStatus(status)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={submitStatusUpdate}
            disabled={
              isUpdatingRepairJobStatus || statusDraft === repairJob.status
            }
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {isUpdatingRepairJobStatus ? "Updating..." : "Update Status"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-emerald-900/70">
          You can view status, but status updates are restricted by role.
        </p>
      )}

      {statusError ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-2 py-1.5 text-xs text-red-700">
          {statusError}
        </p>
      ) : null}
    </div>
  );
};

export default RepairJobStatusControls;
