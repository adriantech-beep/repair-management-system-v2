import type {
  AllocatePartRequest,
  RepairJobPartResponse,
} from "@/types/repairJobPart";
import apiClient from "./httpClient";

function normalizeRepairJobPart(raw: Record<string, unknown>): RepairJobPartResponse {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    partId: String(raw.partId ?? raw.PartId ?? ""),
    partName: String(raw.partName ?? raw.PartName ?? "Unknown Part"),
    partNumber: String(raw.partNumber ?? raw.PartNumber ?? "N/A"),
    quantity: Number(raw.quantity ?? raw.Quantity ?? 0),
    unitPrice: Number(raw.unitPrice ?? raw.UnitPrice ?? 0),
    totalPrice: Number(raw.totalPrice ?? raw.TotalPrice ?? 0),
    allocatedAtUtc: String(raw.allocatedAtUtc ?? raw.AllocatedAtUtc ?? ""),
  };
}

function extractArrayPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data;

    const items = (payload as { items?: unknown }).items;
    if (Array.isArray(items)) return items;
  }
  return [];
}

export async function getRepairJobParts(jobId: string): Promise<RepairJobPartResponse[]> {
  const response = await apiClient.get<unknown>(`/api/repair-jobs/${jobId}/parts`);
  return extractArrayPayload(response.data)
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .map(normalizeRepairJobPart);
}

export async function allocateRepairJobPart(
  jobId: string,
  payload: AllocatePartRequest,
): Promise<RepairJobPartResponse> {
  const response = await apiClient.post<unknown>(
    `/api/repair-jobs/${jobId}/parts`,
    payload,
  );
  if (!response.data || typeof response.data !== "object") {
    throw new Error("Unexpected allocateRepairJobPart response shape.");
  }
  return normalizeRepairJobPart(response.data as Record<string, unknown>);
}

export async function removeRepairJobPart(
  jobId: string,
  allocatedPartId: string,
): Promise<void> {
  await apiClient.delete<unknown>(
    `/api/repair-jobs/${jobId}/parts/${allocatedPartId}`,
  );
}
