import { act, renderHook } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { updateRepairJob, updateRepairJobStatus } from "@/api/repairJobApi";
import { useUpdateRepairJob, useUpdateRepairJobStatus } from "./useRepairJobs";

vi.mock("@/api/repairJobApi", () => ({
  createRepairJob: vi.fn(),
  getRepairJobById: vi.fn(),
  getRepairJobs: vi.fn(),
  updateRepairJob: vi.fn(),
  updateRepairJobStatus: vi.fn(),
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

describe("useUpdateRepairJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates detail cache and invalidates repair-job list", async () => {
    const queryClient = createTestClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(updateRepairJob).mockResolvedValue({
      id: "job-1",
      customerId: "customer-1",
      deviceId: "device-1",
      branchId: "branch-1",
      jobNumber: "RJ-1",
      problemDescription: "Updated problem",
      diagnosisNotes: "Diagnostic note",
      resolutionNotes: null,
      estimatedCost: 1000,
      finalCost: null,
      status: "Diagnosing",
      receivedAtUtc: "2026-05-10T10:00:00Z",
      completedAtUtc: null,
      createdAtUtc: "2026-05-10T10:00:00Z",
      updatedAtUtc: "2026-05-10T11:00:00Z",
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateRepairJob(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        repairJobId: "job-1",
        payload: {
          problemDescription: "Updated problem",
          diagnosisNotes: "Diagnostic note",
          resolutionNotes: null,
          estimatedCost: 1000,
          finalCost: null,
        },
      });
    });

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      ["repair-job", "job-1"],
      expect.objectContaining({ id: "job-1" }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["repair-jobs"] });
  });
});

describe("useUpdateRepairJobStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates detail cache and invalidates repair-job list", async () => {
    const queryClient = createTestClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(updateRepairJobStatus).mockResolvedValue({
      id: "job-1",
      customerId: "customer-1",
      deviceId: "device-1",
      branchId: "branch-1",
      jobNumber: "RJ-1",
      problemDescription: "Issue",
      diagnosisNotes: null,
      resolutionNotes: null,
      estimatedCost: null,
      finalCost: null,
      status: "Repairing",
      receivedAtUtc: "2026-05-10T10:00:00Z",
      completedAtUtc: null,
      createdAtUtc: "2026-05-10T10:00:00Z",
      updatedAtUtc: "2026-05-10T11:00:00Z",
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateRepairJobStatus(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        repairJobId: "job-1",
        payload: { status: "Repairing" },
      });
    });

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      ["repair-job", "job-1"],
      expect.objectContaining({ status: "Repairing" }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["repair-jobs"] });
  });
});
