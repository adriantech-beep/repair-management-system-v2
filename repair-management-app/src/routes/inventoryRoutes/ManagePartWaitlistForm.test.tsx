import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartResponse, WaitlistResponse } from "@/types/inventory";
import ManagePartWaitlistForm from "./ManagePartWaitlistForm";

const mockCreateWaitlist = vi.fn();
const mockUpdateWaitlistStatus = vi.fn();
const mockGetWaitlistByPart = vi.fn();

vi.mock("@/hooks/useInventory", () => ({
  useCreateWaitlistRequest: () => ({ mutateAsync: mockCreateWaitlist }),
  useGetWaitlistByPart: (...args: unknown[]) => mockGetWaitlistByPart(...args),
  useUpdateWaitlistStatus: () => ({
    mutateAsync: mockUpdateWaitlistStatus,
  }),
}));

const samplePart: PartResponse = {
  id: "part-1",
  partNumber: "PN-001",
  name: "Battery",
  category: "Power",
  stockQuantity: 0,
  supplierPrice: 19.5,
  sellingPrice: 29.99,
  isActive: true,
  compatibilities: [],
};

const sampleWaitlist: WaitlistResponse[] = [
  {
    id: "waitlist-1",
    partId: samplePart.id,
    customerName: "Juan Dela Cruz",
    customerEmail: "juan@example.com",
    customerPhone: null,
    preferredContactMethod: "Email",
    status: "Pending",
    createdAtUtc: "2026-05-18T08:00:00Z",
    notifiedAtUtc: null,
    resolvedAtUtc: null,
    notes: "Needs original quality",
  },
];

function renderForm() {
  mockGetWaitlistByPart.mockReturnValue({
    data: sampleWaitlist,
    isLoading: false,
    isFetching: false,
  });

  return render(<ManagePartWaitlistForm part={samplePart} />);
}

describe("ManagePartWaitlistForm", () => {
  beforeEach(() => {
    mockCreateWaitlist.mockReset();
    mockUpdateWaitlistStatus.mockReset();
    mockGetWaitlistByPart.mockReset();
    mockCreateWaitlist.mockResolvedValue({});
    mockUpdateWaitlistStatus.mockResolvedValue({});
  });

  it("renders the current waitlist and refetches when the filter changes", async () => {
    const user = userEvent.setup();

    renderForm();

    expect(screen.getByText("Juan Dela Cruz")).toBeInTheDocument();
    expect(screen.getByText("Needs original quality")).toBeInTheDocument();
    expect(mockGetWaitlistByPart).toHaveBeenCalledWith(
      samplePart.id,
      undefined,
    );

    await user.selectOptions(
      screen.getByLabelText("Filter waitlist by status"),
      "Pending",
    );

    await waitFor(() => {
      expect(mockGetWaitlistByPart).toHaveBeenLastCalledWith(
        samplePart.id,
        "Pending",
      );
    });
  });

  it("creates a waitlist request with the normalized payload", async () => {
    const user = userEvent.setup();

    renderForm();

    await user.type(screen.getByLabelText("Customer Name"), " Maria Santos ");
    await user.type(screen.getByLabelText("Email"), "maria@example.com");
    await user.type(screen.getByLabelText("Phone"), "09171234567");
    await user.type(screen.getByLabelText("Notes"), "  Call after 5pm  ");
    await user.click(
      screen.getByRole("button", { name: /Create Waitlist Request/i }),
    );

    expect(mockCreateWaitlist).toHaveBeenCalledWith({
      partId: samplePart.id,
      payload: {
        customerName: "Maria Santos",
        customerEmail: "maria@example.com",
        customerPhone: "09171234567",
        preferredContactMethod: "Email",
        notes: "Call after 5pm",
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText("Waitlist request created successfully."),
      ).toBeInTheDocument();
    });
  });

  it("updates an existing waitlist status", async () => {
    const user = userEvent.setup();

    renderForm();

    await user.selectOptions(
      screen.getByLabelText("Update status for Juan Dela Cruz"),
      "Resolved",
    );

    await user.click(screen.getByRole("button", { name: /Update Status/i }));

    expect(mockUpdateWaitlistStatus).toHaveBeenCalledWith({
      waitlistRequestId: "waitlist-1",
      payload: {
        status: "Resolved",
      },
    });
  });
});
