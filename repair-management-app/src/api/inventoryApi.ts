import type {
  CreateWaitlistRequest,
  GetPartsParams,
  PartResponse,
  WaitlistResponse,
  WaitlistStatus,
} from "@/types/inventory";
import apiClient from "./httpClient";

function normalizeNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizePart(raw: Record<string, unknown>): PartResponse {
  const compatibilities = Array.isArray(raw.compatibilities)
    ? raw.compatibilities
    : Array.isArray(raw.Compatibilities)
      ? raw.Compatibilities
      : [];

  return {
    id: String(raw.id ?? raw.Id ?? ""),
    partNumber: String(raw.partNumber ?? raw.PartNumber ?? ""),
    name: String(raw.name ?? raw.Name ?? ""),
    category: String(raw.category ?? raw.Category ?? ""),
    stockQuantity: Number(raw.stockQuantity ?? raw.StockQuantity ?? 0),
    supplierPrice: Number(raw.supplierPrice ?? raw.SupplierPrice ?? 0),
    sellingPrice: Number(raw.sellingPrice ?? raw.SellingPrice ?? 0),
    isActive: Boolean(raw.isActive ?? raw.IsActive ?? false),
    compatibilities: compatibilities
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object",
      )
      .map((item) => ({
        id: String(item.id ?? item.Id ?? ""),
        brand: String(item.brand ?? item.Brand ?? ""),
        modelName: String(item.modelName ?? item.ModelName ?? ""),
      })),
  };
}

function normalizeWaitlistResponse(
  raw: Record<string, unknown>,
): WaitlistResponse {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    partId: String(raw.partId ?? raw.PartId ?? ""),
    customerName: String(raw.customerName ?? raw.CustomerName ?? ""),
    customerEmail: normalizeNullableString(
      raw.customerEmail ?? raw.CustomerEmail,
    ),
    customerPhone: normalizeNullableString(
      raw.customerPhone ?? raw.CustomerPhone,
    ),
    preferredContactMethod: String(
      raw.preferredContactMethod ?? raw.PreferredContactMethod ?? "Email",
    ) as WaitlistResponse["preferredContactMethod"],
    status: String(raw.status ?? raw.Status ?? "Pending") as WaitlistStatus,
    createdAtUtc: String(raw.createdAtUtc ?? raw.CreatedAtUtc ?? ""),
    notifiedAtUtc: normalizeNullableString(
      raw.notifiedAtUtc ?? raw.NotifiedAtUtc,
    ),
    resolvedAtUtc: normalizeNullableString(
      raw.resolvedAtUtc ?? raw.ResolvedAtUtc,
    ),
    notes: normalizeNullableString(raw.notes ?? raw.Notes),
  };
}

function extractArrayPayload(payload: unknown) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data;

    const items = (payload as { items?: unknown }).items;
    if (Array.isArray(items)) return items;
  }

  return [];
}

export async function getParts(
  params?: GetPartsParams,
): Promise<PartResponse[]> {
  const response = await apiClient.get<unknown>("/api/parts", {
    params,
  });

  return extractArrayPayload(response.data)
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .map(normalizePart);
}

export async function getWaitlistByPart(
  partId: string,
  status?: WaitlistStatus,
): Promise<WaitlistResponse[]> {
  const response = await apiClient.get<unknown>(
    `/api/parts/${partId}/waitlist`,
    {
      params: status ? { status } : undefined,
    },
  );

  return extractArrayPayload(response.data)
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .map(normalizeWaitlistResponse);
}

export async function createWaitlistRequest(
  partId: string,
  payload: CreateWaitlistRequest,
): Promise<WaitlistResponse> {
  const response = await apiClient.post<unknown>(
    `/api/parts/${partId}/waitlist`,
    payload,
  );

  if (!response.data || typeof response.data !== "object") {
    throw new Error("Unexpected createWaitlistRequest response shape.");
  }

  return normalizeWaitlistResponse(response.data as Record<string, unknown>);
}
