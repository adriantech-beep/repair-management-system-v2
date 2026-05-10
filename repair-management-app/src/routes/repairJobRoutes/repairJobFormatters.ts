import type { RepairJobStatus } from "@/types/repairJob";

export const repairJobStatusLabels: Record<RepairJobStatus, string> = {
  Received: "Received",
  Diagnosing: "Diagnosing",
  Repairing: "Repairing",
  ReadyForPickup: "Ready for pickup",
  Completed: "Completed",
  Cancelled: "Cancelled",
};

export const repairJobStatusClasses: Record<RepairJobStatus, string> = {
  Received: "bg-slate-100 text-slate-700",
  Diagnosing: "bg-amber-100 text-amber-800",
  Repairing: "bg-blue-100 text-blue-800",
  ReadyForPickup: "bg-emerald-100 text-emerald-800",
  Completed: "bg-teal-100 text-teal-800",
  Cancelled: "bg-rose-100 text-rose-800",
};

export function formatRepairJobStatus(status: RepairJobStatus) {
  return repairJobStatusLabels[status];
}

export function formatCurrency(value: number | null) {
  if (value == null) return "Not set";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(value: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatOptionalText(value: string | null | undefined) {
  return value?.trim() ? value : "Not provided";
}
