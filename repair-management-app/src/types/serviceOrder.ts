import type { DeviceType } from "./device";

export type CreateRepairJobRequest = {
  customerId: string;
  deviceId: string;
  branchId: string;
  problemDescription: string;
  estimatedCost: number | null;
};

export type ServiceOrderMode = "existing-record" | "new-intake";

export type ServiceOrderCustomerIntake = {
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
};

export type ServiceOrderDeviceIntake = {
  brand: string;
  model: string;
  imeiOrSerialNumber: string | null;
  deviceType: DeviceType;
};

export type ServiceOrderRepairDetails = {
  problemDescription: string;
  estimatedCost: number | null;
};

export type ExistingRecordServiceOrderInput = {
  mode: "existing-record";
  customerId: string;
  deviceId: string;
  repairDetails: ServiceOrderRepairDetails;
};

export type NewIntakeServiceOrderInput = {
  mode: "new-intake";
  customer: ServiceOrderCustomerIntake;
  device: ServiceOrderDeviceIntake;
  repairDetails: ServiceOrderRepairDetails;
};

export type ServiceOrderCreateInput =
  | ExistingRecordServiceOrderInput
  | NewIntakeServiceOrderInput;
