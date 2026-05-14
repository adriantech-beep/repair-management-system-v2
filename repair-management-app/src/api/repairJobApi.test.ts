import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getRepairJobById,
  getRepairJobs,
  updateRepairJob,
  updateRepairJobStatus,
} from "./repairJobApi";
import apiClient from "./httpClient";

vi.mock("./httpClient", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("repairJobApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns repair jobs from a nested items payload", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        items: [
          {
            id: "job-1",
            customerId: "customer-1",
            deviceId: "device-1",
            jobNumber: "RJ-1",
            problemDescription: "Screen issue",
            status: "Received",
            estimatedCost: 1200,
            receivedAtUtc: "2026-05-10T10:00:00Z",
          },
        ],
      },
    });

    await expect(getRepairJobs()).resolves.toEqual([
      expect.objectContaining({ id: "job-1", jobNumber: "RJ-1" }),
    ]);
  });

  it("returns a repair job from nested data payload", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: {
          id: "job-1",
          customerId: "customer-1",
          deviceId: "device-1",
          branchId: "branch-1",
          jobNumber: "RJ-1",
          problemDescription: "Battery not charging",
          diagnosisNotes: null,
          resolutionNotes: null,
          estimatedCost: null,
          finalCost: null,
          status: "Diagnosing",
          receivedAtUtc: "2026-05-10T10:00:00Z",
          completedAtUtc: null,
          createdAtUtc: "2026-05-10T10:00:00Z",
          updatedAtUtc: "2026-05-10T10:00:00Z",
        },
      },
    });

    await expect(getRepairJobById("job-1")).resolves.toEqual(
      expect.objectContaining({ id: "job-1", status: "Diagnosing" }),
    );
  });

  it("updates a repair job via PUT", async () => {
    vi.mocked(apiClient.put).mockResolvedValue({
      data: {
        id: "job-1",
        customerId: "customer-1",
        deviceId: "device-1",
        branchId: "branch-1",
        jobNumber: "RJ-1",
        problemDescription: "Updated problem",
        diagnosisNotes: "Diagnosed",
        resolutionNotes: null,
        estimatedCost: 500,
        finalCost: null,
        status: "Diagnosing",
        receivedAtUtc: "2026-05-10T10:00:00Z",
        completedAtUtc: null,
        createdAtUtc: "2026-05-10T10:00:00Z",
        updatedAtUtc: "2026-05-10T11:00:00Z",
      },
    });

    await expect(
      updateRepairJob("job-1", {
        problemDescription: "Updated problem",
        diagnosisNotes: "Diagnosed",
        resolutionNotes: null,
        estimatedCost: 500,
        finalCost: null,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "job-1",
        problemDescription: "Updated problem",
      }),
    );

    expect(apiClient.put).toHaveBeenCalledWith("/api/repair-jobs/job-1", {
      problemDescription: "Updated problem",
      diagnosisNotes: "Diagnosed",
      resolutionNotes: null,
      estimatedCost: 500,
      finalCost: null,
    });
  });

  it("updates repair job status via PATCH", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: {
        id: "job-1",
        customerId: "customer-1",
        deviceId: "device-1",
        branchId: "branch-1",
        jobNumber: "RJ-1",
        problemDescription: "Charging issue",
        diagnosisNotes: null,
        resolutionNotes: null,
        estimatedCost: null,
        finalCost: null,
        status: "Repairing",
        receivedAtUtc: "2026-05-10T10:00:00Z",
        completedAtUtc: null,
        createdAtUtc: "2026-05-10T10:00:00Z",
        updatedAtUtc: "2026-05-10T11:00:00Z",
      },
    });

    await expect(
      updateRepairJobStatus("job-1", { status: "Repairing" }),
    ).resolves.toEqual(expect.objectContaining({ status: "Repairing" }));

    expect(apiClient.patch).toHaveBeenCalledWith(
      "/api/repair-jobs/job-1/status",
      { status: "Repairing" },
    );
  });
});
