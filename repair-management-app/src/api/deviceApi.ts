import type {
  CreateDeviceRequest,
  DeviceLookupResponse,
  DeviceListItem,
  DeviceResponse,
  UpdateDeviceRequest,
} from "@/types/device";
import apiClient from "./httpClient";

type DeviceListItemApi = Omit<DeviceListItem, "imeiOrSerialNumber"> & {
  imeiOrSerialNumber?: string | null;
  ImeiOrSerialNumber?: string | null;
  serialNumber?: string | null;
  SerialNumber?: string | null;
};

type DeviceResponseApi = Omit<DeviceResponse, "imeiOrSerialNumber"> & {
  imeiOrSerialNumber?: string | null;
  ImeiOrSerialNumber?: string | null;
  serialNumber?: string | null;
  SerialNumber?: string | null;
};

type DeviceIdentifierSource = Record<string, unknown>;

type DeviceLookupResponseApi = {
  deviceId?: string;
  DeviceId?: string;
  customerId?: string;
  CustomerId?: string;
  customerName?: string;
  CustomerName?: string;
  customerPhone?: string;
  CustomerPhone?: string;
  brand?: string;
  Brand?: string;
  model?: string;
  Model?: string;
  serialNumber?: string | null;
  SerialNumber?: string | null;
  deviceType?: string;
  DeviceType?: string;
};

function normalizeIdentifierKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readFromLooseIdentifierKeys(
  raw: DeviceIdentifierSource,
): string | null {
  const preferredKeys = new Set([
    "imeiorserialnumber",
    "imeinumber",
    "imei",
    "serialnumber",
  ]);

  for (const [key, value] of Object.entries(raw)) {
    const normalized = normalizeIdentifierKey(key);
    if (!preferredKeys.has(normalized)) continue;
    if (typeof value === "string" && value.trim() !== "") return value;
  }

  return null;
}

function readImeiOrSerialNumber(
  raw: Pick<
    DeviceResponseApi,
    | "imeiOrSerialNumber"
    | "ImeiOrSerialNumber"
    | "serialNumber"
    | "SerialNumber"
  >,
): string | null {
  return (
    raw.imeiOrSerialNumber ??
    raw.ImeiOrSerialNumber ??
    raw.serialNumber ??
    raw.SerialNumber ??
    readFromLooseIdentifierKeys(raw as DeviceIdentifierSource) ??
    null
  );
}

function withCompatImeiOrSerialNumber<
  T extends { imeiOrSerialNumber: string | null },
>(payload: T) {
  return {
    ...payload,
    serialNumber: payload.imeiOrSerialNumber,
  };
}

function normalizeDeviceListItem(raw: DeviceListItemApi): DeviceListItem {
  return {
    ...raw,
    imeiOrSerialNumber: readImeiOrSerialNumber(raw),
  };
}

function normalizeDeviceResponse(raw: DeviceResponseApi): DeviceResponse {
  return {
    ...raw,
    imeiOrSerialNumber: readImeiOrSerialNumber(raw),
  };
}

function extractDeviceListPayload(
  payload: unknown,
): DeviceListItemApi[] | undefined {
  if (Array.isArray(payload)) return payload as DeviceListItemApi[];
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as DeviceListItemApi[];

    const items = (payload as { items?: unknown }).items;
    if (Array.isArray(items)) return items as DeviceListItemApi[];
  }

  return undefined;
}

function extractDevicePayload(payload: unknown): DeviceResponseApi | undefined {
  if (payload && typeof payload === "object") {
    if ("id" in (payload as object)) return payload as DeviceResponseApi;

    const nested = (payload as { data?: unknown }).data;
    if (nested && typeof nested === "object" && "id" in (nested as object)) {
      return nested as DeviceResponseApi;
    }
  }

  return undefined;
}

function extractDeviceLookupPayload(
  payload: unknown,
): DeviceLookupResponseApi | undefined {
  if (payload && typeof payload === "object") {
    if (
      "deviceId" in (payload as object) ||
      "DeviceId" in (payload as object)
    ) {
      return payload as DeviceLookupResponseApi;
    }

    const nested = (payload as { data?: unknown }).data;
    if (
      nested &&
      typeof nested === "object" &&
      ("deviceId" in (nested as object) || "DeviceId" in (nested as object))
    ) {
      return nested as DeviceLookupResponseApi;
    }
  }

  return undefined;
}

function normalizeDeviceLookupResponse(
  raw: DeviceLookupResponseApi,
): DeviceLookupResponse {
  return {
    deviceId: raw.deviceId ?? raw.DeviceId ?? "",
    customerId: raw.customerId ?? raw.CustomerId ?? "",
    customerName: raw.customerName ?? raw.CustomerName ?? "",
    customerPhone: raw.customerPhone ?? raw.CustomerPhone ?? "",
    brand: raw.brand ?? raw.Brand ?? "",
    model: raw.model ?? raw.Model ?? "",
    serialNumber: raw.serialNumber ?? raw.SerialNumber ?? null,
    deviceType: (raw.deviceType ??
      raw.DeviceType ??
      "Other") as DeviceLookupResponse["deviceType"],
  };
}

export async function createDevice(
  payload: CreateDeviceRequest,
): Promise<DeviceResponse> {
  const response = await apiClient.post<unknown>(
    "/api/devices",
    withCompatImeiOrSerialNumber(payload),
  );
  const normalized = extractDevicePayload(response.data);

  if (!normalized) {
    throw new Error("Unexpected createDevice response shape.");
  }

  return normalizeDeviceResponse(normalized);
}

export async function getDevicesByCustomerId(
  customerId: string,
): Promise<DeviceListItem[]> {
  const response = await apiClient.get<unknown>(
    `/api/devices/customer/${customerId}`,
  );
  const rows = extractDeviceListPayload(response.data);

  if (!rows) return [];

  return rows.map(normalizeDeviceListItem);
}

export async function getDeviceById(deviceId: string): Promise<DeviceResponse> {
  const response = await apiClient.get<unknown>(`/api/devices/${deviceId}`);
  const normalized = extractDevicePayload(response.data);

  if (!normalized) {
    throw new Error("Unexpected getDeviceById response shape.");
  }

  return normalizeDeviceResponse(normalized);
}

export async function updateDevice(
  deviceId: string,
  payload: UpdateDeviceRequest,
): Promise<DeviceResponse> {
  const response = await apiClient.put<unknown>(
    `/api/devices/${deviceId}`,
    withCompatImeiOrSerialNumber(payload),
  );
  const normalized = extractDevicePayload(response.data);

  if (!normalized) {
    throw new Error("Unexpected updateDevice response shape.");
  }

  return normalizeDeviceResponse(normalized);
}

export async function deleteDevice(deviceId: string): Promise<void> {
  await apiClient.delete(`/api/devices/${deviceId}`);
}

export async function lookupDeviceByIdentifier(
  identifier: string,
): Promise<DeviceLookupResponse> {
  const response = await apiClient.get<unknown>("/api/devices/lookup", {
    params: { identifier },
  });

  const normalized = extractDeviceLookupPayload(response.data);
  if (!normalized) {
    throw new Error("Unexpected lookupDeviceByIdentifier response shape.");
  }

  return normalizeDeviceLookupResponse(normalized);
}
