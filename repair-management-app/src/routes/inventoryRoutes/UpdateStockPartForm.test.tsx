import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartResponse } from "@/types/inventory";
import { MemoryRouter } from "react-router-dom";
import UpdateStockPartForm from "./UpdateStockPartForm";

const mockMutateAsync = vi.fn();
const mockOnclose = vi.fn();

let currentRole: string | null = "Technician";

const mockUseAuthStore = vi.fn((selector: (state: unknown) => unknown) =>
  selector({
    user: currentRole
      ? {
          role: currentRole,
        }
      : null,
  }),
);

vi.mock("@/store/authStore", () => ({
  default: (selector: (state: unknown) => unknown) =>
    mockUseAuthStore(selector),
}));

const samplePart: PartResponse = {
  id: "part-1",
  partNumber: "PN-001",
  name: "Battery",
  category: "Power",
  stockQuantity: 15,
  supplierPrice: 19.5,
  sellingPrice: 29.99,
  isActive: true,
  compatibilities: [
    {
      id: "comp-1",
      brand: "Samsung",
      modelName: "Galaxy S24",
    },
  ],
};

vi.mock("@/hooks/useInventory", () => ({
  useUpdatePartStock: () => ({ mutateAsync: mockMutateAsync }),
}));

const renderUpdateStockPartForm = () =>
  render(
    <MemoryRouter>
      <UpdateStockPartForm part={samplePart} onCloseModal={mockOnclose} />
    </MemoryRouter>,
  );

describe("UpdateStockPartForm", () => {
  beforeEach(() => {
    currentRole = "Admin";

    mockMutateAsync.mockReset();
    mockOnclose.mockReset();
    mockMutateAsync.mockResolvedValue({});
  });

  it("calls mutateAsync with correct payload and navigates on success", async () => {
    const user = userEvent.setup();

    renderUpdateStockPartForm();

    await user.clear(screen.getByLabelText("New Quantity"));
    await user.type(screen.getByLabelText("New Quantity"), "20");
    await user.click(screen.getByRole("button", { name: /Save Stock/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      newQuantity: 20,
      reason: null,
    });

    await waitFor(() => expect(mockOnclose).toHaveBeenCalled());
  });

  it("calls mutateAsync where user types for reason and navigates on success", async () => {
    const user = userEvent.setup();

    renderUpdateStockPartForm();

    await user.clear(screen.getByLabelText("Reason (optional)"));
    await user.type(
      screen.getByLabelText("Reason (optional)"),
      "Updated stock for testing",
    );
    await user.click(screen.getByRole("button", { name: /Save Stock/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      newQuantity: samplePart.stockQuantity,
      reason: "Updated stock for testing",
    });

    await waitFor(() => expect(mockOnclose).toHaveBeenCalled());
  });
});
