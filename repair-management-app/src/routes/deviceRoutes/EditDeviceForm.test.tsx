import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import EditDeviceForm from "./EditDeviceForm";
import { useFormContext } from "react-hook-form";
import type { DeviceFormData } from "./deviceSchema";

const mockMutateAsync = vi.fn();
const mockOnCloseModal = vi.fn();

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
  useGetDeviceById: () => ({
    data: deviceFixture,
    isLoading: false,
    isError: false,
  }),
  useUpdateDevice: () => ({ mutateAsync: mockMutateAsync }),
}));

vi.mock("./CreateDeviceFields", () => ({
  default: () => {
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
    mockMutateAsync.mockReset();
    mockOnCloseModal.mockReset();
    mockMutateAsync.mockResolvedValue({ ...deviceFixture });
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
});
