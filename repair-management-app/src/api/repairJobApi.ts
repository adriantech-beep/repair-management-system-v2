import type {
  RepairJobListItem,
  RepairJobResponse,
  RepairJobStatus,
  UpdateRepairJobRequest,
  UpdateRepairJobStatusRequest,
} from "@/types/repairJob";
import type { CreateRepairJobRequest } from "@/types/serviceOrder";
import apiClient from "./httpClient";

type RepairJobListPayload =
  | RepairJobListItem[]
  | { data?: unknown; items?: unknown };
type RepairJobDetailPayload = RepairJobResponse | { data?: unknown };

function extractRepairJobList(payload: RepairJobListPayload | unknown) {
  if (Array.isArray(payload)) return payload as RepairJobListItem[];

  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as RepairJobListItem[];

    const items = (payload as { items?: unknown }).items;
    if (Array.isArray(items)) return items as RepairJobListItem[];
  }

  return [];
}

function extractRepairJob(payload: RepairJobDetailPayload | unknown) {
  if (payload && typeof payload === "object") {
    if ("id" in (payload as object)) return payload as RepairJobResponse;

    const data = (payload as { data?: unknown }).data;
    if (data && typeof data === "object" && "id" in (data as object)) {
      return data as RepairJobResponse;
    }
  }

  throw new Error("Unexpected repair job response shape.");
}

export async function getRepairJobs(status?: RepairJobStatus) {
  const response = await apiClient.get<unknown>("/api/repair-jobs", {
    params: status ? { status } : undefined,
  });

  return extractRepairJobList(response.data);
}

export async function getRepairJobById(repairJobId: string) {
  const response = await apiClient.get<unknown>(
    `/api/repair-jobs/${repairJobId}`,
  );
  return extractRepairJob(response.data);
}

export async function createRepairJob(payload: CreateRepairJobRequest) {
  const response = await apiClient.post<unknown>("/api/repair-jobs", payload);
  return extractRepairJob(response.data);
}

export async function updateRepairJob(
  repairJobId: string,
  payload: UpdateRepairJobRequest,
) {
  const response = await apiClient.put<unknown>(
    `/api/repair-jobs/${repairJobId}`,
    payload,
  );

  return extractRepairJob(response.data);
}

export async function updateRepairJobStatus(
  repairJobId: string,
  payload: UpdateRepairJobStatusRequest,
) {
  const response = await apiClient.patch<unknown>(
    `/api/repair-jobs/${repairJobId}/status`,
    payload,
  );

  return extractRepairJob(response.data);
}
