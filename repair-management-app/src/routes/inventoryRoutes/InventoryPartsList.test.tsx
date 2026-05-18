import TypedMenus from "@/context/Menus";
import TypedTable from "@/context/Table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartResponse } from "@/types/inventory";
import InventoryPartsList from "./InventoryPartsList";

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

vi.mock("./EditPartInventoryForm", () => ({
  default: () => <div>EditPartInventoryForm</div>,
}));

vi.mock("./UpdateStockPartForm", () => ({
  default: () => <div>UpdateStockPartForm</div>,
}));

vi.mock("./ManagePartCompatibilityForm", () => ({
  default: () => <div>ManagePartCompatibilityForm</div>,
}));

vi.mock("./InventoryPartDetailView", () => ({
  default: () => <div>InventoryPartDetailView</div>,
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

function renderInventoryRow() {
  return render(
    <TypedMenus>
      <TypedTable columns="1.2fr 1.3fr 1fr 1fr 1fr auto">
        <InventoryPartsList inventory={samplePart} />
      </TypedTable>
    </TypedMenus>,
  );
}

describe("InventoryPartsList", () => {
  beforeEach(() => {
    currentRole = "Technician";
  });

  it("shows part detail modal when view is clicked", async () => {
    const user = userEvent.setup();

    renderInventoryRow();

    await user.click(screen.getByRole("button", { name: "View" }));

    expect(screen.getByText("InventoryPartDetailView")).toBeInTheDocument();
  });

  it("shows view action but hides admin actions for technician", () => {
    renderInventoryRow();

    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(
      screen.queryByText("ManagePartCompatibilityForm"),
    ).not.toBeInTheDocument();
  });

  it("treats missing role as non-admin and hides admin actions", () => {
    currentRole = null;

    renderInventoryRow();

    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("shows admin menu actions for admin users", async () => {
    currentRole = "Admin";
    const user = userEvent.setup();

    renderInventoryRow();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);

    const toggleButton = buttons.find(
      (button) => button.textContent !== "View",
    );
    expect(toggleButton).toBeDefined();

    await user.click(toggleButton!);

    expect(screen.getByText("Edit Part Details")).toBeInTheDocument();
    expect(screen.getByText("Update Stock")).toBeInTheDocument();
    expect(screen.getByText("Manage Compatibility")).toBeInTheDocument();
  });
  it("opens update stock modal from admin actions", async () => {
    currentRole = "Admin";
    const user = userEvent.setup();

    renderInventoryRow();

    // Admin modals should not be mounted before any action is selected.
    expect(screen.queryByText("UpdateStockPartForm")).not.toBeInTheDocument();
    expect(
      screen.queryByText("ManagePartCompatibilityForm"),
    ).not.toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    const toggleButton = buttons.find(
      (button) => button.textContent !== "View",
    );

    expect(toggleButton).toBeDefined();
    await user.click(toggleButton!);
    await user.click(screen.getByText("Update Stock"));

    expect(screen.getByText("UpdateStockPartForm")).toBeInTheDocument();
  });
  it("opens part compatibilty modal from admin actions", async () => {
    currentRole = "Admin";
    const user = userEvent.setup();

    renderInventoryRow();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    const toggleButton = buttons.find(
      (button) => button.textContent !== "View",
    );
    expect(toggleButton).toBeDefined();
    await user.click(toggleButton!);
    await user.click(screen.getByText("Manage Compatibility"));

    expect(screen.getByText("ManagePartCompatibilityForm")).toBeInTheDocument();
  });
});
