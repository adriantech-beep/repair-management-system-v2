import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RepairJobDetail from "./RepairJobDetail";

const mockUseGetRepairJobById = vi.fn();
const mockUseGetParts = vi.fn();
const mockUseCreateWaitlistRequest = vi.fn();
const mockUseGetCustomerById = vi.fn();
const mockUseGetDeviceById = vi.fn();

vi.mock("@/hooks/useRepairJobs", () => ({
  useGetRepairJobById: (repairJobId: string) =>
    mockUseGetRepairJobById(repairJobId),
}));

vi.mock("@/hooks/useInventory", () => ({
  useGetParts: () => mockUseGetParts(),
  useCreateWaitlistRequest: () => mockUseCreateWaitlistRequest(),
}));

vi.mock("@/hooks/useCustomers", () => ({
  useGetCustomerById: (customerId: string) =>
    mockUseGetCustomerById(customerId),
}));

vi.mock("@/hooks/useDevices", () => ({
  useGetDeviceById: (deviceId: string) => mockUseGetDeviceById(deviceId),
}));

function mockDefaultDependencies() {
  mockUseGetParts.mockReturnValue({
    data: [],
    isLoading: false,
  });

  mockUseCreateWaitlistRequest.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  mockUseGetCustomerById.mockReturnValue({
    data: undefined,
  });

  mockUseGetDeviceById.mockReturnValue({
    data: undefined,
  });
}

describe("RepairJobDetail", () => {
  it("renders safe fallback values for optional fields", () => {
    mockDefaultDependencies();

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
    mockDefaultDependencies();

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

  it("shows waitlist action for compatible out-of-stock parts", () => {
    mockUseGetParts.mockReturnValue({
      data: [
        {
          id: "part-1",
          partNumber: "LCD-001",
          name: "Screen Assembly",
          category: "Display",
          stockQuantity: 0,
          supplierPrice: 20,
          sellingPrice: 45,
          isActive: true,
          compatibilities: [
            {
              id: "compat-1",
              brand: "Apple",
              modelName: "iPhone 12",
            },
          ],
        },
      ],
      isLoading: false,
    });

    mockUseCreateWaitlistRequest.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseGetCustomerById.mockReturnValue({
      data: {
        id: "customer-1",
        fullName: "Jane Tech",
        phone: "09171234567",
        email: "jane@example.com",
        address: null,
        branchId: "branch-1",
        createdAtUtc: "2026-05-10T10:00:00Z",
        updatedAtUtc: "2026-05-10T10:00:00Z",
      },
    });

    mockUseGetDeviceById.mockReturnValue({
      data: {
        id: "device-1",
        customerId: "customer-1",
        branchId: "branch-1",
        brand: "Apple",
        model: "iPhone 12",
        imeiOrSerialNumber: "ABC123",
        deviceType: "Mobile",
        createdAtUtc: "2026-05-10T10:00:00Z",
        updatedAtUtc: "2026-05-10T10:00:00Z",
      },
    });

    mockUseGetRepairJobById.mockReturnValue({
      data: {
        id: "job-1",
        customerId: "customer-1",
        deviceId: "device-1",
        branchId: "branch-1",
        jobNumber: "RJ-1",
        problemDescription: "Screen crack",
        diagnosisNotes: null,
        resolutionNotes: null,
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

    expect(screen.getByText("Parts Availability")).toBeInTheDocument();
    expect(screen.getByText("Create Waitlist Request")).toBeInTheDocument();
  });
});
