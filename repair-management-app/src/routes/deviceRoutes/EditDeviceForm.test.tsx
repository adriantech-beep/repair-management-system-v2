import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useFormContext } from "react-hook-form";
import type { DeviceFormData } from "./deviceSchema";
import EditDeviceForm from "./EditDeviceForm";

const mockMutateAsync = vi.fn();
const mockOnCloseModal = vi.fn();
const mockUseGetDeviceById = vi.fn();

const deviceFixture = {
  id: "device-1",
  customerId: "customer-1",
  branchId: "branch-1",
  brand: "Apple",
  model: "iPhone 13",
  imeiOrSerialNumber: "123456789",
  deviceType: "Mobile" as const,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

vi.mock("@/hooks/useDevices", () => ({
  useGetDeviceById: (...args: unknown[]) => mockUseGetDeviceById(...args),
  useUpdateDevice: () => ({ mutateAsync: mockMutateAsync }),
}));

vi.mock("@/api/parseApiError", () => ({
  default: (error: unknown) => error,
}));

vi.mock("./CreateDeviceFields", () => ({
  default: function MockCreateDeviceFields() {
    const { register } = useFormContext<DeviceFormData>();

    return (
      <div>
        <label htmlFor="brand">Brand</label>
        <input id="brand" aria-label="Brand" {...register("brand")} />

        <label htmlFor="model">Model</label>
        <input id="model" aria-label="Model" {...register("model")} />

        <label htmlFor="imeiOrSerialNumber">IMEI / Serial Number</label>
        <input
          id="imeiOrSerialNumber"
          aria-label="IMEI / Serial Number"
          {...register("imeiOrSerialNumber")}
        />

        <label htmlFor="deviceType">Device Type</label>
        <input
          id="deviceType"
          aria-label="Device Type"
          {...register("deviceType")}
        />
      </div>
    );
  },
}));

describe("EditDeviceForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({ ...deviceFixture });

    mockUseGetDeviceById.mockReturnValue({
      data: deviceFixture,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("prefills the form with the loaded device and submits the update payload", async () => {
    const user = userEvent.setup();

    render(
      <EditDeviceForm
        deviceId={deviceFixture.id}
        onCloseModal={mockOnCloseModal}
      />,
    );

    expect(screen.getByLabelText("Brand")).toHaveValue("Apple");
    expect(screen.getByLabelText("Model")).toHaveValue("iPhone 13");
    expect(screen.getByLabelText("IMEI / Serial Number")).toHaveValue(
      "123456789",
    );
    expect(screen.getByLabelText("Device Type")).toHaveValue("Mobile");

    await user.clear(screen.getByLabelText("Brand"));
    await user.type(screen.getByLabelText("Brand"), "Samsung");
    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        deviceId: deviceFixture.id,
        customerId: deviceFixture.customerId,
        payload: {
          brand: "Samsung",
          model: "iPhone 13",
          imeiOrSerialNumber: "123456789",
          deviceType: "Mobile",
        },
      });
      expect(mockOnCloseModal).toHaveBeenCalled();
    });
  });

  it("shows root error on 409 conflict", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue({
      status: 409,
      message: "Conflict.",
    });

    render(
      <EditDeviceForm
        deviceId={deviceFixture.id}
        onCloseModal={mockOnCloseModal}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(await screen.findByText("Conflict.")).toBeInTheDocument();
    expect(mockOnCloseModal).not.toHaveBeenCalled();
  });

  it("shows not found state when load returns 404", () => {
    mockUseGetDeviceById.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 404, message: "Not found" },
    });

    render(<EditDeviceForm deviceId={deviceFixture.id} />);

    expect(screen.getByText("Device not found.")).toBeInTheDocument();
  });

  it("shows forbidden state when load returns 403", () => {
    mockUseGetDeviceById.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 403, message: "Forbidden" },
    });

    render(<EditDeviceForm deviceId={deviceFixture.id} />);

    expect(
      screen.getByText("You do not have permission to view this device."),
    ).toBeInTheDocument();
  });
});
