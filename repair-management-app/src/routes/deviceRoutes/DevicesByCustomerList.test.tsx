import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import TypedTable from "@/context/Table";
import TypedMenus from "@/context/Menus";
import DevicesByCustomerList from "./DevicesByCustomerList";

const mockDeleteMutateAsync = vi.fn();

vi.mock("@/hooks/useDevices", () => ({
  useDeleteDevice: () => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  }),
}));

vi.mock("./EditDeviceForm", () => ({
  default: ({ deviceId }: { deviceId: string }) => (
    <div>Edit form for {deviceId}</div>
  ),
}));

const deviceFixture = {
  id: "device-1",
  customerId: "customer-1",
  brand: "Apple",
  model: "iPhone 13",
  imeiOrSerialNumber: "123456789",
  deviceType: "Mobile" as const,
  createdAtUtc: "2026-01-01T00:00:00Z",
};

const renderRow = () =>
  render(
    <TypedMenus>
      <TypedTable columns="1fr 1fr 1fr 1fr 120px">
        <DevicesByCustomerList device={deviceFixture} />
      </TypedTable>
    </TypedMenus>,
  );

describe("DevicesByCustomerList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteMutateAsync.mockResolvedValue(undefined);
  });

  it("switches the row into inline edit mode when Edit is clicked", async () => {
    const user = userEvent.setup();

    renderRow();

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("iPhone 13")).toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByText("Edit form for device-1")).toBeInTheDocument();
  });

  it("calls delete hook when user confirms delete action", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderRow();

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(mockDeleteMutateAsync).toHaveBeenCalledWith({
      deviceId: "device-1",
      customerId: "customer-1",
    });

    confirmSpy.mockRestore();
  });
});
