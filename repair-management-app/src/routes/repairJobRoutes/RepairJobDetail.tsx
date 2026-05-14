import parseApiError from "@/api/parseApiError";
import { useGetCustomerById } from "@/hooks/useCustomers";
import { useGetDeviceById } from "@/hooks/useDevices";
import { useCreateWaitlistRequest, useGetParts } from "@/hooks/useInventory";
import {
  useGetRepairJobById,
  useUpdateRepairJob,
  useUpdateRepairJobStatus,
} from "@/hooks/useRepairJobs";
import useAuthStore from "@/store/authStore";
import type {
  PartResponse,
  PreferredContactMethod,
  WaitlistStatus,
} from "@/types/inventory";
import { repairJobStatuses, type RepairJobStatus } from "@/types/repairJob";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  formatCurrency,
  formatDateTime,
  formatOptionalText,
  formatRepairJobStatus,
  repairJobStatusClasses,
} from "./repairJobFormatters";

type WaitlistDraft = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredContactMethod: PreferredContactMethod;
  notes: string;
};

type RepairJobUpdateDraft = {
  problemDescription: string;
  diagnosisNotes: string;
  resolutionNotes: string;
  estimatedCost: string;
  finalCost: string;
};

const emptyWaitlistDraft: WaitlistDraft = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  preferredContactMethod: "Phone",
  notes: "",
};

const emptyRepairJobUpdateDraft: RepairJobUpdateDraft = {
  problemDescription: "",
  diagnosisNotes: "",
  resolutionNotes: "",
  estimatedCost: "",
  finalCost: "",
};

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function isPartCompatibleWithDevice(
  part: PartResponse,
  brand: string,
  model: string,
) {
  if (!part.compatibilities.length) return false;

  const normalizedBrand = normalizeText(brand);
  const normalizedModel = normalizeText(model);

  return part.compatibilities.some(
    (compatibility) =>
      normalizeText(compatibility.brand) === normalizedBrand &&
      normalizeText(compatibility.modelName) === normalizedModel,
  );
}

function waitlistStatusClass(status: WaitlistStatus) {
  if (status === "Resolved") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (status === "Notified") {
    return "bg-sky-100 text-sky-800";
  }
  if (status === "Cancelled") {
    return "bg-zinc-200 text-zinc-700";
  }
  return "bg-amber-100 text-amber-800";
}

const RepairJobDetail = () => {
  const { repairJobId = "" } = useParams();
  const user = useAuthStore((state) => state.user);
  const {
    data: repairJob,
    isLoading,
    isError,
    error,
  } = useGetRepairJobById(repairJobId);
  const { mutateAsync: updateRepairJob, isPending: isUpdatingRepairJob } =
    useUpdateRepairJob();
  const {
    mutateAsync: updateRepairJobStatus,
    isPending: isUpdatingRepairJobStatus,
  } = useUpdateRepairJobStatus();
  const { data: parts = [], isLoading: isLoadingParts } = useGetParts();
  const { mutateAsync: createWaitlistRequest, isPending: isCreatingWaitlist } =
    useCreateWaitlistRequest();
  const { data: customer } = useGetCustomerById(repairJob?.customerId ?? "");
  const { data: device } = useGetDeviceById(repairJob?.deviceId ?? "");

  const [activeWaitlistPartId, setActiveWaitlistPartId] = useState<
    string | null
  >(null);
  const [waitlistDraft, setWaitlistDraft] =
    useState<WaitlistDraft>(emptyWaitlistDraft);
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [repairJobUpdateDraft, setRepairJobUpdateDraft] =
    useState<RepairJobUpdateDraft>(emptyRepairJobUpdateDraft);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<RepairJobStatus>("Received");
  const [statusError, setStatusError] = useState<string | null>(null);

  const normalizedRole = user?.role?.toLowerCase() ?? "";
  const canEditRepairJobDetails = normalizedRole === "admin";
  const canUpdateRepairJobStatus =
    normalizedRole === "admin" || normalizedRole === "technician";

  useEffect(() => {
    if (!repairJob) return;

    setRepairJobUpdateDraft({
      problemDescription: repairJob.problemDescription,
      diagnosisNotes: repairJob.diagnosisNotes ?? "",
      resolutionNotes: repairJob.resolutionNotes ?? "",
      estimatedCost:
        repairJob.estimatedCost == null ? "" : String(repairJob.estimatedCost),
      finalCost: repairJob.finalCost == null ? "" : String(repairJob.finalCost),
    });
    setStatusDraft(repairJob.status);
  }, [repairJob]);

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

  const parseOptionalCost = (value: string, label: string) => {
    const normalized = value.trim();
    if (normalized === "") return null;

    const parsed = Number(normalized);
    if (Number.isNaN(parsed) || parsed < 0) {
      throw new Error(`${label} must be a valid non-negative number.`);
    }

    return parsed;
  };

  const submitRepairJobUpdate = async () => {
    if (!canEditRepairJobDetails || isUpdatingRepairJob) return;

    try {
      setUpdateError(null);
      setUpdateMessage(null);

      if (repairJobUpdateDraft.problemDescription.trim().length < 5) {
        setUpdateError("Problem description must be at least 5 characters.");
        return;
      }

      const estimatedCost = parseOptionalCost(
        repairJobUpdateDraft.estimatedCost,
        "Estimated cost",
      );
      const finalCost = parseOptionalCost(
        repairJobUpdateDraft.finalCost,
        "Final cost",
      );

      await updateRepairJob({
        repairJobId,
        payload: {
          problemDescription: repairJobUpdateDraft.problemDescription.trim(),
          diagnosisNotes: repairJobUpdateDraft.diagnosisNotes.trim() || null,
          resolutionNotes: repairJobUpdateDraft.resolutionNotes.trim() || null,
          estimatedCost,
          finalCost,
        },
      });

      setUpdateMessage("Repair job details updated.");
    } catch (submitError) {
      const parsed = parseApiError(submitError);
      setUpdateError(parsed.message || "Unable to update repair job.");
    }
  };

  const submitStatusUpdate = async () => {
    if (!canUpdateRepairJobStatus || isUpdatingRepairJobStatus) return;

    try {
      setStatusError(null);

      await updateRepairJobStatus({
        repairJobId,
        payload: { status: statusDraft },
      });
    } catch (submitError) {
      const parsed = parseApiError(submitError);
      setStatusError(parsed.message || "Unable to update repair job status.");
    }
  };

  const filteredParts =
    device?.brand && device?.model
      ? parts.filter((part) =>
          isPartCompatibleWithDevice(part, device.brand, device.model),
        )
      : parts;

  const inStockParts = filteredParts.filter((part) => part.stockQuantity > 0);
  const outOfStockParts = filteredParts.filter(
    (part) => part.stockQuantity === 0,
  );

  const openWaitlistForm = (partId: string) => {
    setActiveWaitlistPartId(partId);
    setWaitlistMessage(null);
    setWaitlistError(null);
    setWaitlistDraft({
      customerName: customer?.fullName ?? "",
      customerEmail: customer?.email ?? "",
      customerPhone: customer?.phone ?? "",
      preferredContactMethod: customer?.phone ? "Phone" : "Email",
      notes: `Repair job ${repairJob.jobNumber}`,
    });
  };

  const cancelWaitlistForm = () => {
    setActiveWaitlistPartId(null);
    setWaitlistDraft(emptyWaitlistDraft);
    setWaitlistMessage(null);
    setWaitlistError(null);
  };

  const submitWaitlist = async (partId: string) => {
    try {
      setWaitlistMessage(null);
      setWaitlistError(null);

      if (!waitlistDraft.customerName.trim()) {
        setWaitlistError("Customer name is required.");
        return;
      }

      if (
        !waitlistDraft.customerEmail.trim() &&
        !waitlistDraft.customerPhone.trim()
      ) {
        setWaitlistError("At least one contact method is required.");
        return;
      }

      await createWaitlistRequest({
        partId,
        payload: {
          customerName: waitlistDraft.customerName.trim(),
          customerEmail: waitlistDraft.customerEmail.trim() || null,
          customerPhone: waitlistDraft.customerPhone.trim() || null,
          preferredContactMethod: waitlistDraft.preferredContactMethod,
          notes: waitlistDraft.notes.trim() || null,
        },
      });

      setWaitlistMessage("Waitlist request created successfully.");
      setActiveWaitlistPartId(null);
    } catch (submitError) {
      const parsed = parseApiError(submitError);
      setWaitlistError(parsed.message || "Unable to create waitlist request.");
    }
  };

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
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
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
              <p className="text-xs text-emerald-900/70">
                Contract-backed update fields for problem details and costs.
              </p>
            </div>

            <label className="block text-xs font-medium text-emerald-900/80">
              Problem Description
              <textarea
                value={repairJobUpdateDraft.problemDescription}
                onChange={(event) =>
                  setRepairJobUpdateDraft((current) => ({
                    ...current,
                    problemDescription: event.target.value,
                  }))
                }
                rows={3}
                disabled={!canEditRepairJobDetails || isUpdatingRepairJob}
                className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm disabled:opacity-70"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-emerald-900/80">
                Diagnosis Notes
                <textarea
                  value={repairJobUpdateDraft.diagnosisNotes}
                  onChange={(event) =>
                    setRepairJobUpdateDraft((current) => ({
                      ...current,
                      diagnosisNotes: event.target.value,
                    }))
                  }
                  rows={2}
                  disabled={!canEditRepairJobDetails || isUpdatingRepairJob}
                  className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm disabled:opacity-70"
                />
              </label>

              <label className="text-xs font-medium text-emerald-900/80">
                Resolution Notes
                <textarea
                  value={repairJobUpdateDraft.resolutionNotes}
                  onChange={(event) =>
                    setRepairJobUpdateDraft((current) => ({
                      ...current,
                      resolutionNotes: event.target.value,
                    }))
                  }
                  rows={2}
                  disabled={!canEditRepairJobDetails || isUpdatingRepairJob}
                  className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm disabled:opacity-70"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-emerald-900/80">
                Estimated Cost
                <input
                  value={repairJobUpdateDraft.estimatedCost}
                  onChange={(event) =>
                    setRepairJobUpdateDraft((current) => ({
                      ...current,
                      estimatedCost: event.target.value,
                    }))
                  }
                  disabled={!canEditRepairJobDetails || isUpdatingRepairJob}
                  className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm disabled:opacity-70"
                />
              </label>

              <label className="text-xs font-medium text-emerald-900/80">
                Final Cost
                <input
                  value={repairJobUpdateDraft.finalCost}
                  onChange={(event) =>
                    setRepairJobUpdateDraft((current) => ({
                      ...current,
                      finalCost: event.target.value,
                    }))
                  }
                  disabled={!canEditRepairJobDetails || isUpdatingRepairJob}
                  className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm disabled:opacity-70"
                />
              </label>
            </div>

            {updateError ? (
              <p className="rounded-md border border-red-100 bg-red-50 px-2 py-1.5 text-xs text-red-700">
                {updateError}
              </p>
            ) : null}

            {updateMessage ? (
              <p className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-800">
                {updateMessage}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-2">
              {canEditRepairJobDetails ? (
                <button
                  type="button"
                  onClick={submitRepairJobUpdate}
                  disabled={isUpdatingRepairJob}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {isUpdatingRepairJob ? "Saving..." : "Save Job Details"}
                </button>
              ) : (
                <p className="text-xs text-emerald-900/70">
                  Detail edits require Admin role.
                </p>
              )}
            </div>
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

        <aside className="space-y-4">
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

          <section className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-emerald-950">
                Parts Availability
              </h2>
              <p className="mt-1 text-sm text-emerald-900/60">
                Compatible inventory for this repair device.
              </p>
            </div>

            {isLoadingParts ? (
              <p className="text-sm text-emerald-900/70">Loading parts...</p>
            ) : filteredParts.length === 0 ? (
              <p className="text-sm text-emerald-900/70">
                No compatible parts found for this device.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-sm text-emerald-900/80">
                  <span className="font-semibold text-emerald-950">
                    In Stock:
                  </span>{" "}
                  {inStockParts.length} part(s)
                  <span className="ml-4 font-semibold text-emerald-950">
                    Out of Stock:
                  </span>{" "}
                  {outOfStockParts.length} part(s)
                </div>

                {filteredParts.map((part) => {
                  const isOutOfStock = part.stockQuantity === 0;
                  const isWaitlistOpen = activeWaitlistPartId === part.id;

                  return (
                    <article
                      key={part.id}
                      className="space-y-3 rounded-xl border border-emerald-100 p-3"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-emerald-950">
                            {part.name}
                          </p>
                          <p className="text-xs text-emerald-900/70">
                            {part.partNumber} · {part.category}
                          </p>
                        </div>
                        <span
                          className={`inline-flex self-start rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isOutOfStock
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isOutOfStock
                            ? "Out of stock"
                            : `${part.stockQuantity} in stock`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700"
                          disabled
                        >
                          Reserve Part to Job (I11)
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700"
                          disabled
                        >
                          Record Part Usage (I12)
                        </button>
                        {isOutOfStock ? (
                          <button
                            type="button"
                            onClick={() =>
                              isWaitlistOpen
                                ? cancelWaitlistForm()
                                : openWaitlistForm(part.id)
                            }
                            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800"
                          >
                            {isWaitlistOpen
                              ? "Cancel Waitlist"
                              : "Create Waitlist Request"}
                          </button>
                        ) : null}
                      </div>

                      {isWaitlistOpen ? (
                        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                            Waitlist Request
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <label className="text-xs font-medium text-emerald-900/80">
                              Customer Name
                              <input
                                value={waitlistDraft.customerName}
                                onChange={(event) =>
                                  setWaitlistDraft((current) => ({
                                    ...current,
                                    customerName: event.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm"
                              />
                            </label>

                            <label className="text-xs font-medium text-emerald-900/80">
                              Preferred Contact
                              <select
                                value={waitlistDraft.preferredContactMethod}
                                onChange={(event) =>
                                  setWaitlistDraft((current) => ({
                                    ...current,
                                    preferredContactMethod: event.target
                                      .value as PreferredContactMethod,
                                  }))
                                }
                                className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm"
                              >
                                <option value="Phone">Phone</option>
                                <option value="Email">Email</option>
                              </select>
                            </label>

                            <label className="text-xs font-medium text-emerald-900/80">
                              Customer Phone
                              <input
                                value={waitlistDraft.customerPhone}
                                onChange={(event) =>
                                  setWaitlistDraft((current) => ({
                                    ...current,
                                    customerPhone: event.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm"
                              />
                            </label>

                            <label className="text-xs font-medium text-emerald-900/80">
                              Customer Email
                              <input
                                value={waitlistDraft.customerEmail}
                                onChange={(event) =>
                                  setWaitlistDraft((current) => ({
                                    ...current,
                                    customerEmail: event.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm"
                              />
                            </label>
                          </div>

                          <label className="block text-xs font-medium text-emerald-900/80">
                            Notes
                            <textarea
                              value={waitlistDraft.notes}
                              onChange={(event) =>
                                setWaitlistDraft((current) => ({
                                  ...current,
                                  notes: event.target.value,
                                }))
                              }
                              rows={2}
                              className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm"
                            />
                          </label>

                          {waitlistError ? (
                            <p className="rounded-md border border-red-100 bg-red-50 px-2 py-1.5 text-xs text-red-700">
                              {waitlistError}
                            </p>
                          ) : null}

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => submitWaitlist(part.id)}
                              disabled={isCreatingWaitlist}
                              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              {isCreatingWaitlist
                                ? "Submitting..."
                                : "Submit Waitlist"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelWaitlistForm}
                              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}

            {waitlistMessage ? (
              <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {waitlistMessage}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 p-6">
            <h2 className="text-lg font-semibold text-sky-900">
              Parts Usage Integration Points
            </h2>
            <p className="mt-2 text-sm text-sky-900/75">
              Action hooks for part reservation and consumption are already
              placed in this layout and will be wired to I11/I12 backend
              endpoints once available.
            </p>
            <span
              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${waitlistStatusClass("Pending")}`}
            >
              Waitlist path active
            </span>
          </section>

          <section className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6">
            <h2 className="text-lg font-semibold text-emerald-950">Timeline</h2>
            <p className="mt-2 text-sm text-emerald-900/70">
              Timeline entries will appear here once the backend exposes the
              timeline endpoint. The detail layout already isolates this panel
              so the future integration stays local.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default RepairJobDetail;
