import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDevice,
  lookupDeviceByIdentifier,
  updateDevice,
} from "./deviceApi";
import apiClient from "./httpClient";

vi.mock("./httpClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("deviceApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes IMEI / serial payload for createDevice", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        data: {
          id: "device-1",
          customerId: "customer-1",
          branchId: "branch-1",
          brand: "Apple",
          model: "iPhone 13",
          ImeiOrSerialNumber: "SN-123",
          deviceType: "Mobile",
          createdAtUtc: "2026-01-01T00:00:00Z",
          updatedAtUtc: "2026-01-01T00:00:00Z",
        },
      },
    });

    await createDevice({
      customerId: "customer-1",
      branchId: "branch-1",
      brand: "Apple",
      model: "iPhone 13",
      imeiOrSerialNumber: "  SN-123  ",
      deviceType: "Mobile",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/api/devices", {
      customerId: "customer-1",
      branchId: "branch-1",
      brand: "Apple",
      model: "iPhone 13",
      imeiOrSerialNumber: "SN-123",
      serialNumber: "SN-123",
      deviceType: "Mobile",
    });
  });

  it("normalizes empty identifier to null for updateDevice", async () => {
    vi.mocked(apiClient.put).mockResolvedValue({
      data: {
        id: "device-1",
        customerId: "customer-1",
        branchId: "branch-1",
        brand: "Apple",
        model: "iPhone 13",
        imeiOrSerialNumber: null,
        deviceType: "Mobile",
        createdAtUtc: "2026-01-01T00:00:00Z",
        updatedAtUtc: "2026-01-01T00:00:00Z",
      },
    });

    await updateDevice("device-1", {
      brand: "Apple",
      model: "iPhone 13",
      imeiOrSerialNumber: "   ",
      deviceType: "Mobile",
    });

    expect(apiClient.put).toHaveBeenCalledWith("/api/devices/device-1", {
      brand: "Apple",
      model: "iPhone 13",
      imeiOrSerialNumber: null,
      serialNumber: null,
      deviceType: "Mobile",
    });
  });

  it("normalizes lookup response fields and trims lookup query identifier", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        DeviceId: "device-9",
        CustomerId: "customer-9",
        CustomerName: "Jane Doe",
        CustomerPhone: "09170000000",
        Brand: "Samsung",
        Model: "S24",
        ImeiOrSerialNumber: "IMEI-9",
        DeviceType: "Mobile",
      },
    });

    await expect(lookupDeviceByIdentifier("  IMEI-9  ")).resolves.toEqual({
      deviceId: "device-9",
      customerId: "customer-9",
      customerName: "Jane Doe",
      customerPhone: "09170000000",
      brand: "Samsung",
      model: "S24",
      serialNumber: "IMEI-9",
      deviceType: "Mobile",
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/devices/lookup", {
      params: { identifier: "IMEI-9" },
    });
  });
});
