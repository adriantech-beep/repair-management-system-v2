import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RepairJobsTable from "./RepairJobsTable";

const mockUseGetRepairJobs = vi.fn();

vi.mock("@/hooks/useRepairJobs", () => ({
  useGetRepairJobs: (status?: string) => mockUseGetRepairJobs(status),
}));

describe("RepairJobsTable", () => {
  it("shows a no-match message when a status filter has no rows", () => {
    mockUseGetRepairJobs.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter initialEntries={["/repair-jobs?status=Completed"]}>
        <Routes>
          <Route path="/repair-jobs" element={<RepairJobsTable />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(mockUseGetRepairJobs).toHaveBeenCalledWith("Completed");
    expect(
      screen.getByText("No repair jobs match the selected status."),
    ).toBeInTheDocument();
  });

  it("updates the active filter and shows a matching row", async () => {
    const user = userEvent.setup();

    mockUseGetRepairJobs.mockImplementation((status?: string) => ({
      data:
        status === "Repairing"
          ? [
              {
                id: "job-1",
                customerId: "customer-1",
                deviceId: "device-1",
                jobNumber: "RJ-1",
                problemDescription: "Charging port repair",
                status: "Repairing",
                estimatedCost: 1800,
                receivedAtUtc: "2026-05-10T10:00:00Z",
              },
            ]
          : [],
      isLoading: false,
      isError: false,
    }));

    render(
      <MemoryRouter initialEntries={["/repair-jobs"]}>
        <Routes>
          <Route path="/repair-jobs" element={<RepairJobsTable />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.selectOptions(
      screen.getByLabelText("Filter repair jobs by status"),
      "Repairing",
    );

    expect(await screen.findByText("RJ-1")).toBeInTheDocument();
    expect(screen.getByText("Charging port repair")).toBeInTheDocument();
  });
});
