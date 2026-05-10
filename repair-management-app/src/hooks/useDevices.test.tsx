import { act, renderHook } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { useDeleteDevice, useUpdateDevice } from "./useDevices";
import { deleteDevice, updateDevice } from "@/api/deviceApi";

vi.mock("@/api/deviceApi", () => ({
  createDevice: vi.fn(),
  deleteDevice: vi.fn(),
  getDeviceById: vi.fn(),
  getDevicesByCustomerId: vi.fn(),
  updateDevice: vi.fn(),
}));

function createTestClient(config?: QueryClientConfig) {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
    ...config,
  });
}

describe("useUpdateDevice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates single device and customer list using provided customerId", async () => {
    const queryClient = createTestClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(updateDevice).mockResolvedValue({
      id: "device-1",
      customerId: "customer-from-api",
      branchId: "branch-1",
      brand: "Samsung",
      model: "Galaxy S24",
      imeiOrSerialNumber: "SN-1",
      deviceType: "Mobile",
      createdAtUtc: "2026-01-01T00:00:00Z",
      updatedAtUtc: "2026-01-01T00:00:00Z",
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateDevice(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        deviceId: "device-1",
        customerId: "customer-explicit",
        payload: {
          brand: "Samsung",
          model: "Galaxy S24",
          imeiOrSerialNumber: "SN-1",
          deviceType: "Mobile",
        },
      });
    });

    expect(updateDevice).toHaveBeenCalledWith("device-1", {
      brand: "Samsung",
      model: "Galaxy S24",
      imeiOrSerialNumber: "SN-1",
      deviceType: "Mobile",
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["device", "device-1"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["devices", "customer-explicit"],
    });
  });

  it("falls back to response customerId when variables.customerId is missing", async () => {
    const queryClient = createTestClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(updateDevice).mockResolvedValue({
      id: "device-2",
      customerId: "customer-from-response",
      branchId: "branch-1",
      brand: "Apple",
      model: "iPhone 14",
      imeiOrSerialNumber: null,
      deviceType: "Mobile",
      createdAtUtc: "2026-01-01T00:00:00Z",
      updatedAtUtc: "2026-01-01T00:00:00Z",
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateDevice(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        deviceId: "device-2",
        payload: {
          brand: "Apple",
          model: "iPhone 14",
          imeiOrSerialNumber: null,
          deviceType: "Mobile",
        },
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["device", "device-2"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["devices", "customer-from-response"],
    });
  });
});

describe("useDeleteDevice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates customer-scoped list and removes single-device cache", async () => {
    const queryClient = createTestClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const removeSpy = vi.spyOn(queryClient, "removeQueries");

    vi.mocked(deleteDevice).mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteDevice(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        deviceId: "device-3",
        customerId: "customer-9",
      });
    });

    expect(deleteDevice).toHaveBeenCalledWith("device-3");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["devices", "customer-9"],
    });
    expect(removeSpy).toHaveBeenCalledWith({
      queryKey: ["device", "device-3"],
      exact: true,
    });
  });
});
