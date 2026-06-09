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
import { useRef } from "react"; // ➕ Add this
import { useReactToPrint } from "react-to-print"; // ➕ Add this
import { Button } from "@/components/ui/button"; // ➕ Add this
import { IntakeJobSheet } from "@/components/printing/IntakeJobSheet"; // ➕ Add this
import { InvoiceTemplate } from "@/components/printing/InvoiceTemplate"; // ➕ Add this
import { useGetRepairJobParts } from "@/hooks/useRepairJobParts"; // ➕ Add this
import { useGetPublicTenant } from "@/hooks/useTenants"; // ➕ Add this


const RepairJobDetail = () => {
  const { repairJobId = "" } = useParams();
  const user = useAuthStore((state) => state.user);


  const normalizedRole = user?.role?.toLowerCase() ?? "";
  const canEditRepairJobDetails = normalizedRole === "admin";

  const { data: tenant } = useGetPublicTenant();
  const companyName = tenant?.companyName || "Pines Multi-Telecom";

  const {
    data: repairJob,
    isLoading,
    isError,
    error,
  } = useGetRepairJobById(repairJobId);
  const { data: jobParts = [] } = useGetRepairJobParts(repairJobId);
  const { data: customer } = useGetCustomerById(repairJob?.customerId ?? "");
  const { data: device } = useGetDeviceById(repairJob?.deviceId ?? "");
  const intakeRef = useRef<HTMLDivElement>(null);


  const handlePrintIntake = useReactToPrint({
    contentRef: intakeRef,
  });

  const invoiceRef = useRef<HTMLDivElement>(null);
  const handlePrintInvoice = useReactToPrint({
    contentRef: invoiceRef,
  });

  // Data Map for A4 Intake Sheet
  // Data Map for A4 Intake Sheet
  const intakeSheetData = {
    ticketId: repairJob?.jobNumber ?? "",
    createdAt: repairJob?.createdAtUtc ?? "",
    customerName: customer?.fullName ?? "Unknown Customer",
    customerPhone: customer?.phone ?? "N/A",
    customerEmail: customer?.email ?? null,
    customerAddress: customer?.address ?? null,
    deviceBrand: device?.brand ?? "Unknown Brand",
    deviceModel: device?.model ?? "Unknown Model",
    imeiOrSerialNumber: device?.imeiOrSerialNumber ?? null, // 🔄 Fallback to null
    deviceType: device?.deviceType ?? "Other", // 🔄 Fallback to "Other" (valid DeviceType)
    problemDescription: repairJob?.problemDescription ?? "",
    estimatedCost: repairJob?.estimatedCost ?? null, // 🔄 Fallback to null (number | null)
    branchName: `${companyName} - Main`,
    branchPhone: "+63 74 442 1234",
    branchAddress: "45 Session Road, Baguio City, Philippines",
    customConsentNotes: repairJob?.diagnosisNotes ?? "",
    companyName: companyName,
  };

  // Data Map for A4 Sales Invoice
  const invoiceData = {
    ticketId: repairJob?.jobNumber ?? "",
    receivedAt: repairJob?.receivedAtUtc ?? "",
    completedAt: repairJob?.completedAtUtc ?? null, // 🔄 Fallback to null
    customerName: customer?.fullName ?? "Unknown Customer",
    customerPhone: customer?.phone ?? "N/A",
    customerEmail: customer?.email ?? null,
    customerAddress: customer?.address ?? null,
    deviceBrand: device?.brand ?? "Unknown Brand",
    deviceModel: device?.model ?? "Unknown Model",
    imeiOrSerialNumber: device?.imeiOrSerialNumber ?? null, // 🔄 Fallback to null
    deviceType: device?.deviceType ?? "Other", // 🔄 Fallback to "Other"
    problemDescription: repairJob?.problemDescription ?? "",
    resolutionNotes: repairJob?.resolutionNotes ?? null,
    laborCost: repairJob?.estimatedCost ?? 0.0,
    parts: (jobParts || []).map((jp) => ({
      partName: `${jp.partName} (${jp.partNumber})`,
      unitPrice: jp.unitPrice,
      quantity: jp.quantity,
      subtotal: jp.totalPrice,
    })),
    finalCost: repairJob?.finalCost ?? 0.0,
    status: repairJob?.status ?? "Received",
    isPaid: repairJob?.status === "Completed", 
    branchName: `${companyName} - Main`,
    branchPhone: "+63 74 442 1234",
    branchAddress: "45 Session Road, Baguio City, Philippines",
    companyName: companyName,
  };

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

            {/* Print Panel Upgrade */}
            <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-3">
              <h2 className="text-lg font-semibold text-emerald-950">
                Print & Job Documents
              </h2>
              <p className="text-xs text-emerald-900/60 leading-relaxed">
                Generate and print standard A4 coupon bond sheets for customer signatures, condition reports, and billing records.
              </p>
              <div className="flex flex-col gap-2 pt-1.5">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 cursor-pointer animate-duration-200"
                  onClick={() => handlePrintIntake()}
                >
                  📋 Print Intake Job Sheet
                </Button>
                <Button
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer animate-duration-200"
                  onClick={() => handlePrintInvoice()}
                >
                  🖨️ Print Sales Invoice
                </Button>
              </div>
            </section>

            {/* Hidden templates for printing iframe */}
            <div style={{ display: "none" }}>
              <IntakeJobSheet ref={intakeRef} data={intakeSheetData} />
              <InvoiceTemplate ref={invoiceRef} data={invoiceData} />
            </div>


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
