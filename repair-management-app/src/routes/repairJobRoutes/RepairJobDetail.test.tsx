import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RepairJobDetail from "./RepairJobDetail";
import { formatCurrency } from "./repairJobFormatters";

const mockUseGetRepairJobById = vi.fn();
const mockUseUpdateRepairJob = vi.fn();
const mockUseUpdateRepairJobStatus = vi.fn();
const mockUseGetTechnicians = vi.fn();
const mockUseGetParts = vi.fn();
const mockUseCreateWaitlistRequest = vi.fn();
const mockUseGetCustomerById = vi.fn();
const mockUseGetDeviceById = vi.fn();
const mockUseAuthStore = vi.fn();
const mockUseGetRepairJobParts = vi.fn();
const mockUseAllocateRepairJobPart = vi.fn();
const mockUseRemoveRepairJobPart = vi.fn();

vi.mock("@/hooks/useRepairJobs", () => ({
  useGetRepairJobById: (repairJobId: string) =>
    mockUseGetRepairJobById(repairJobId),
  useUpdateRepairJob: () => mockUseUpdateRepairJob(),
  useUpdateRepairJobStatus: () => mockUseUpdateRepairJobStatus(),
  useGetTechnicians: () => mockUseGetTechnicians(),
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

vi.mock("@/hooks/useRepairJobParts", () => ({
  useGetRepairJobParts: (jobId: string) => mockUseGetRepairJobParts(jobId),
  useAllocateRepairJobPart: () => mockUseAllocateRepairJobPart(),
  useRemoveRepairJobPart: () => mockUseRemoveRepairJobPart(),
}));

vi.mock("@/store/authStore", () => ({
  default: (selector: (state: { user: { role: string } | null }) => unknown) =>
    selector(mockUseAuthStore()),
}));

function mockDefaultDependencies() {
  mockUseAuthStore.mockReturnValue({
    user: { role: "Admin" },
  });

  mockUseUpdateRepairJob.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  mockUseUpdateRepairJobStatus.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  mockUseGetTechnicians.mockReturnValue({
    data: [],
    isPending: false,
  });

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

  mockUseGetRepairJobParts.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  });

  mockUseAllocateRepairJobPart.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  mockUseRemoveRepairJobPart.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
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

  it("shows status controls but hides detail edit action for technician role", () => {
    mockDefaultDependencies();
    mockUseAuthStore.mockReturnValue({
      user: { role: "Technician" },
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

    expect(
      screen.getByLabelText("Update repair job status"),
    ).toBeInTheDocument();
    expect(screen.getByText("Update Status")).toBeInTheDocument();
    expect(
      screen.getByText("Detail edits require Admin role."),
    ).toBeInTheDocument();
  });

  it("submits the update form with valid data and calls the mutate API", async () => {
    mockDefaultDependencies();

    const mutateSpy = vi.fn().mockResolvedValue({ id: "job-1" });
    mockUseUpdateRepairJob.mockReturnValue({
      mutateAsync: mutateSpy,
      isPending: false,
    });

    mockUseGetRepairJobById.mockReturnValue({
      data: {
        id: "job-1",
        customerId: "customer-1",
        deviceId: "device-1",
        branchId: "branch-1",
        jobNumber: "RJ-1",
        problemDescription: "Original problem description",
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

    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

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

    const problemInput = screen.getByPlaceholderText("Problem Description");
    const estimatedCostInput = screen.getByPlaceholderText("Estimated Cost");

    expect(problemInput).toHaveValue("Original problem description");

    await user.clear(problemInput);
    await user.type(problemInput, "New problem description that is long enough");
    await user.type(estimatedCostInput, "150");

    const submitButton = screen.getByRole("button", { name: "Save Job Details" });
    await user.click(submitButton);

    expect(mutateSpy).toHaveBeenCalledWith({
      repairJobId: "job-1",
      payload: {
        problemDescription: "New problem description that is long enough",
        diagnosisNotes: null,
        resolutionNotes: null,
        estimatedCost: 150,
        finalCost: null,
        assignedTechnicianId: null,
      },
    });

    expect(await screen.findByText("Repair job details updated.")).toBeInTheDocument();
  });

  it("shows validation error and prevents submission when data is invalid", async () => {
    mockDefaultDependencies();

    const mutateSpy = vi.fn();
    mockUseUpdateRepairJob.mockReturnValue({
      mutateAsync: mutateSpy,
      isPending: false,
    });

    mockUseGetRepairJobById.mockReturnValue({
      data: {
        id: "job-1",
        customerId: "customer-1",
        deviceId: "device-1",
        branchId: "branch-1",
        jobNumber: "RJ-1",
        problemDescription: "Original problem",
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

    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

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

    const problemInput = screen.getByPlaceholderText("Problem Description");

    await user.clear(problemInput);
    await user.type(problemInput, "Bad");

    const submitButton = screen.getByRole("button", { name: "Save Job Details" });
    await user.click(submitButton);

    expect(await screen.findByText("Problem description must be at least 5 characters")).toBeInTheDocument();
    expect(mutateSpy).not.toHaveBeenCalled();
  });

  it("renders assigned technician name in details card and allows assignment update in form", async () => {
    mockDefaultDependencies();

    mockUseGetTechnicians.mockReturnValue({
      data: [
        { id: "e3b0c442-98fc-4c14-9c22-b89113371337", fullName: "John Tech", role: "Technician" },
        { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479", fullName: "Jane Tech", role: "Technician" },
      ],
      isPending: false,
    });

    const mutateSpy = vi.fn().mockResolvedValue({ id: "job-1" });
    mockUseUpdateRepairJob.mockReturnValue({
      mutateAsync: mutateSpy,
      isPending: false,
    });

    mockUseGetRepairJobById.mockReturnValue({
      data: {
        id: "job-1",
        customerId: "customer-1",
        deviceId: "device-1",
        branchId: "branch-1",
        jobNumber: "RJ-1",
        problemDescription: "Original problem description",
        diagnosisNotes: null,
        resolutionNotes: null,
        estimatedCost: null,
        finalCost: null,
        assignedTechnicianId: "e3b0c442-98fc-4c14-9c22-b89113371337",
        assignedTechnicianName: "John Tech",
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

    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

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

    // 1. Assert assigned technician name renders in the details card (renders in both the card and select options)
    expect(screen.getAllByText("John Tech")).toHaveLength(2);

    // 2. Assert dropdown renders inside the edit form with the correct option preselected
    const dropdown = screen.getByLabelText("Assigned Technician");
    expect(dropdown).toHaveValue("e3b0c442-98fc-4c14-9c22-b89113371337");

    // 3. Clear and type into problem description and estimated cost to ensure full form state update
    const problemInput = screen.getByPlaceholderText("Problem Description");
    const estimatedCostInput = screen.getByPlaceholderText("Estimated Cost");

    await user.clear(problemInput);
    await user.type(problemInput, "New problem description that is long enough");
    await user.type(estimatedCostInput, "150");

    // 4. Change assigned technician to Jane Tech
    await user.selectOptions(dropdown, "f47ac10b-58cc-4372-a567-0e02b2c3d479");

    const submitButton = screen.getByRole("button", { name: "Save Job Details" });
    await user.click(submitButton);

    // 5. Wait for the async submission to complete and verify success message is shown
    expect(await screen.findByText("Repair job details updated.")).toBeInTheDocument();

    // 6. Assert correct payload is submitted
    expect(mutateSpy).toHaveBeenCalledWith({
      repairJobId: "job-1",
      payload: {
        problemDescription: "New problem description that is long enough",
        diagnosisNotes: null,
        resolutionNotes: null,
        estimatedCost: 150,
        finalCost: null,
        assignedTechnicianId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      },
    });
  });

  it("renders allocated parts list and allows adding a part", async () => {
    mockDefaultDependencies();

    // Mock allocated parts
    mockUseGetRepairJobParts.mockReturnValue({
      data: [
        {
          id: "alloc-1",
          partId: "part-1",
          partName: "Replacement Screen",
          partNumber: "SCR-123",
          quantity: 2,
          unitPrice: 50.0,
          totalPrice: 100.0,
          allocatedAtUtc: "2026-05-10T10:00:00Z",
        },
      ],
      isLoading: false,
      isError: false,
    });

    // Mock inventory parts
    mockUseGetParts.mockReturnValue({
      data: [
        {
          id: "part-2",
          partNumber: "BATT-456",
          name: "OEM Battery",
          category: "Power",
          stockQuantity: 10,
          supplierPrice: 15,
          sellingPrice: 30,
          isActive: true,
          compatibilities: [],
        },
      ],
      isLoading: false,
      isError: false,
    });

    const allocateSpy = vi.fn().mockResolvedValue({ id: "alloc-2" });
    mockUseAllocateRepairJobPart.mockReturnValue({
      mutateAsync: allocateSpy,
      isPending: false,
    });

    mockUseGetRepairJobById.mockReturnValue({
      data: {
        id: "job-1",
        customerId: "customer-1",
        deviceId: "device-1",
        branchId: "branch-1",
        jobNumber: "RJ-1",
        problemDescription: "Original problem description",
        diagnosisNotes: null,
        resolutionNotes: null,
        estimatedCost: null,
        finalCost: 100.0,
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

    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

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

    // 1. Assert parts panel is displayed
    expect(screen.getByText("Allocated Parts & Materials")).toBeInTheDocument();
    
    // 2. Assert allocated parts table shows linked parts
    expect(screen.getByText("Replacement Screen")).toBeInTheDocument();
    expect(screen.getByText("SCR-123")).toBeInTheDocument();
    expect(screen.getAllByText(formatCurrency(100.00))).toHaveLength(3);

    // 3. Select inventory part and allocate it
    const select = screen.getByRole("combobox", { name: "Select Inventory Part" });
    await user.selectOptions(select, "part-2");

    const addButton = screen.getByRole("button", { name: "Add Part" });
    await user.click(addButton);

    // 4. Verify mock mutation is triggered with correct arguments
    expect(allocateSpy).toHaveBeenCalledWith({
      jobId: "job-1",
      payload: {
        partId: "part-2",
        quantity: 1,
      },
    });
  });
});

