export const repairJobStatuses = [
  "Received",
  "Diagnosing",
  "Repairing",
  "ReadyForPickup",
  "Completed",
  "Cancelled",
] as const;

export type RepairJobStatus = (typeof repairJobStatuses)[number];

export type RepairJobListItem = {
  id: string;
  customerId: string;
  deviceId: string;
  jobNumber: string;
  problemDescription: string;
  status: RepairJobStatus;
  estimatedCost: number | null;
  receivedAtUtc: string;
};

export type RepairJobResponse = {
  id: string;
  customerId: string;
  deviceId: string;
  branchId: string;
  jobNumber: string;
  problemDescription: string;
  diagnosisNotes: string | null;
  resolutionNotes: string | null;
  estimatedCost: number | null;
  finalCost: number | null;
  status: RepairJobStatus;
  receivedAtUtc: string;
  completedAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type UpdateRepairJobRequest = {
  problemDescription: string;
  diagnosisNotes: string | null;
  resolutionNotes: string | null;
  estimatedCost: number | null;
  finalCost: number | null;
};

export type UpdateRepairJobStatusRequest = {
  status: RepairJobStatus;
};
