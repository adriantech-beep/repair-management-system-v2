export type DeviceType = "Mobile" | "Laptop" | "Tablet" | "Desktop" | "Other";

export type DeviceListItem = {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  imeiOrSerialNumber: string | null;
  deviceType: DeviceType;
  createdAtUtc: string;
};

export type DeviceResponse = {
  id: string;
  customerId: string;
  branchId: string;
  brand: string;
  model: string;
  imeiOrSerialNumber: string | null;
  deviceType: DeviceType;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type CreateDeviceRequest = {
  customerId: string;
  branchId: string;
  brand: string;
  model: string;
  imeiOrSerialNumber: string | null;
  deviceType: DeviceType;
};

export type UpdateDeviceRequest = {
  brand: string;
  model: string;
  imeiOrSerialNumber: string | null;
  deviceType: DeviceType;
};

export type DeviceLookupResponse = {
  deviceId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  brand: string;
  model: string;
  serialNumber: string | null;
  deviceType: DeviceType;
};
