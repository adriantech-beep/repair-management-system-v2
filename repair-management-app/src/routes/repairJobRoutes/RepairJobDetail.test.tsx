import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RepairJobDetail from "./RepairJobDetail";

const mockUseGetRepairJobById = vi.fn();

vi.mock("@/hooks/useRepairJobs", () => ({
  useGetRepairJobById: (repairJobId: string) =>
    mockUseGetRepairJobById(repairJobId),
}));

describe("RepairJobDetail", () => {
  it("renders safe fallback values for optional fields", () => {
    mockUseGetRepairJobById.mockReturnValue({
      data: {
        id: "job-1",
        customerId: "customer-1",
        deviceId: "device-1",
        branchId: "branch-1",
        jobNumber: "RJ-1",
        problemDescription: "Overheating during use",
        diagnosisNotes: null,
        resolutionNotes: "",
        estimatedCost: null,
        finalCost: null,
        status: "Received",
        receivedAtUtc: "2026-05-10T10:00:00Z",
        completedAtUtc: null,
        createdAtUtc: "2026-05-10T10:00:00Z",
        updatedAtUtc: "2026-05-10T10:00:00Z",
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/repair-jobs/job-1"]}>
        <Routes>
          <Route
            path="/repair-jobs/:repairJobId"
            element={<RepairJobDetail />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(mockUseGetRepairJobById).toHaveBeenCalledWith("job-1");
    expect(screen.getAllByText("Not provided")).toHaveLength(2);
    expect(screen.getAllByText("Not set")).toHaveLength(2);
    expect(screen.getByText("Timeline")).toBeInTheDocument();
  });

  it("renders a not-found state for 404 responses", () => {
    mockUseGetRepairJobById.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: {
        response: {
          status: 404,
        },
      },
    });

    render(
      <MemoryRouter initialEntries={["/repair-jobs/missing"]}>
        <Routes>
          <Route
            path="/repair-jobs/:repairJobId"
            element={<RepairJobDetail />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Repair job not found.")).toBeInTheDocument();
  });
});
