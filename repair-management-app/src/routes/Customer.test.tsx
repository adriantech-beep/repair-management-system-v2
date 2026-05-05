import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateCustomer from "./CreateCustomer";

// ─── mocks ───────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();
const mockUser = {
  id: "u1",
  email: "admin@test.local",
  role: "Admin",
  branchId: "b1",
};

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/hooks/useCustomers", () => ({
  useCreateCustomer: () => ({ mutateAsync: mockMutateAsync }),
  useGetCustomers: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock("@/store/authStore", () => ({
  default: (selector: (state: { user: typeof mockUser }) => unknown) =>
    selector({ user: mockUser }),
}));

// ─── helpers ─────────────────────────────────────────────────────────────────

const renderCreateCustomer = () =>
  render(
    <MemoryRouter>
      <CreateCustomer />
    </MemoryRouter>,
  );

// ─── tests ───────────────────────────────────────────────────────────────────

describe("CreateCustomer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation error for short fullName and does not call API", async () => {
    const user = userEvent.setup();

    renderCreateCustomer();

    await user.type(screen.getByLabelText("Full Name"), "A");
    await user.click(screen.getByRole("button", { name: /Create Customer/i }));
    expect(
      await screen.findByText("Full name must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("calls mutateAsync with correct payload and navigates on success", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({ id: "c1" });

    renderCreateCustomer();

    await user.type(screen.getByLabelText("Full Name"), "John Doe");
    await user.type(screen.getByLabelText("Phone Number"), "1234567890");
    await user.type(screen.getByLabelText("Email"), "john.doe@test.local");
    await user.type(screen.getByLabelText("Address"), "123 Main St");
    await user.click(screen.getByRole("button", { name: /Create Customer/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        fullName: "John Doe",
        phone: "1234567890",
        email: "john.doe@test.local",
        address: "123 Main St",
        branchId: "b1",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/customers", {
        replace: true,
      });
    });
  });

  it("shows phone field error and root error on 409 conflict", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          message: "Conflict.",
        },
      },
    });

    renderCreateCustomer();
    await user.type(screen.getByLabelText("Full Name"), "John Doe");
    await user.type(screen.getByLabelText("Phone Number"), "1234567890");
    await user.type(screen.getByLabelText("Email"), "john.doe@test.local");
    await user.type(screen.getByLabelText("Address"), "123 Main St");

    await user.click(screen.getByRole("button", { name: /Create Customer/i }));
    expect(
      await screen.findByText("Phone already exists in this branch."),
    ).toBeInTheDocument();
    expect(await screen.findByText("Conflict.")).toBeInTheDocument();
  });

  it("shows root error when API call fails with no response", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue({
      isAxiosError: true,
    });

    renderCreateCustomer();
    await user.type(screen.getByLabelText("Full Name"), "John Doe");
    await user.type(screen.getByLabelText("Phone Number"), "1234567890");
    await user.type(screen.getByLabelText("Email"), "john.doe@test.local");
    await user.type(screen.getByLabelText("Address"), "123 Main St");

    await user.click(screen.getByRole("button", { name: /Create Customer/i }));
    expect(
      await screen.findByText(
        "Cannot reach the server. Check your connection.",
      ),
    ).toBeInTheDocument();
  });
});
