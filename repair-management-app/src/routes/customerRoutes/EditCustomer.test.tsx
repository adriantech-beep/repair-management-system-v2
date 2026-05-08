import { beforeEach, describe, expect, it, vi } from "vitest";
import EditCustomerForm from "./EditCustomerForm";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockMutateAsync = vi.fn();
const mockOnclose = vi.fn();

const customerFixture = {
  id: "abc-123",
  fullName: "John Doe",
  phone: "09171234567",
  email: "john@example.com",
  address: "123 Main St",
  branchId: "branch-1",
  createdAtUtc: "2024-01-01T00:00:00Z",
  updatedAtUtc: "2024-01-01T00:00:00Z",
};

vi.mock("@/hooks/useCustomers", () => ({
  useGetCustomerById: vi.fn(() => ({
    data: customerFixture,
    isLoading: false,
    isError: false,
    error: null,
  })),
  useUpdateCustomer: () => ({ mutateAsync: mockMutateAsync }),
}));

vi.mock("@/store/authStore", () => ({
  default: (
    selector: (state: {
      user: {
        id: string;
        email: string;
        role: string;
        branchId: string;
      } | null;
    }) => unknown,
  ) =>
    selector({
      user: { id: "u1", email: "a@b.com", role: "staff", branchId: "branch-1" },
    }),
}));

vi.mock("@/api/parseApiError", () => ({
  default: (error: unknown) => error,
}));

const renderEditCustomer = () =>
  render(
    <MemoryRouter>
      <EditCustomerForm
        customerId={customerFixture.id}
        onCloseModal={mockOnclose}
      />
    </MemoryRouter>,
  );

describe("EditCustomerForm", () => {
  beforeEach(async () => {
    mockMutateAsync.mockReset();
    mockOnclose.mockReset();
    mockMutateAsync.mockResolvedValue({});

    const { useGetCustomerById } = await import("@/hooks/useCustomers");
    vi.mocked(useGetCustomerById).mockReturnValue({
      data: customerFixture,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
  });

  it("loads existing customer and pre-fills the form", async () => {
    renderEditCustomer();

    expect(screen.getByLabelText("Full Name")).toHaveValue("John Doe");
    expect(screen.getByLabelText("Phone Number")).toHaveValue("09171234567");
    expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
    expect(screen.getByLabelText("Address")).toHaveValue("123 Main St");
  });

  it("calls updateCustomer with correct payload on submit", async () => {
    const user = userEvent.setup();
    renderEditCustomer();
    await user.clear(screen.getByLabelText("Full Name"));
    await user.type(screen.getByLabelText("Full Name"), "Jane Doe");
    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      customerId: "abc-123",
      payload: {
        fullName: "Jane Doe",
        phone: "09171234567",
        email: "john@example.com",
        address: "123 Main St",
        branchId: "branch-1",
      },
    });

    await waitFor(() => expect(mockOnclose).toHaveBeenCalled());
  });

  it("shows phone field error and root error on 409 conflict", async () => {
    const user = userEvent.setup();

    mockMutateAsync.mockRejectedValue({
      status: 409,
      message: "Phone already exists in this branch.",
    });

    renderEditCustomer();

    await user.click(screen.getByRole("button", { name: /Save Changes/i }));
    const conflictMessages = await screen.findAllByText(
      "Phone already exists in this branch.",
    );
    expect(conflictMessages).toHaveLength(2);
    expect(mockOnclose).not.toHaveBeenCalled();
  });

  it("shows generic error when server cannot be reached", async () => {
    const user = userEvent.setup();

    mockMutateAsync.mockRejectedValue({
      status: undefined,
      message: undefined,
    });

    renderEditCustomer();

    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(
      await screen.findByText("Cannot reach the server..."),
    ).toBeInTheDocument();

    expect(mockOnclose).not.toHaveBeenCalled();
  });

  it("shows customer not found error when 404 is returned", async () => {
    const { useGetCustomerById } = vi.mocked(
      await import("@/hooks/useCustomers"),
    );
    useGetCustomerById.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 404, message: "Not found" },
    } as any);

    renderEditCustomer();

    expect(screen.getByText("Customer not found.")).toBeInTheDocument();
  });

  it("shows forbidden error when 403 is returned", async () => {
    const { useGetCustomerById } = vi.mocked(
      await import("@/hooks/useCustomers"),
    );
    useGetCustomerById.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 403, message: "Not found" },
    } as any);

    renderEditCustomer();

    expect(
      screen.getByText("You do not have permission to view this customer."),
    ).toBeInTheDocument();
  });
});
