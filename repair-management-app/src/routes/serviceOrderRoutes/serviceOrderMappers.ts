import type {
  CreateRepairJobRequest,
  ServiceOrderCreateInput,
  ServiceOrderCustomerIntake,
  ServiceOrderDeviceIntake,
  ServiceOrderRepairDetails,
} from "@/types/serviceOrder";

export type NewIntakeResolvedIds = {
  customerId: string;
  deviceId: string;
};

type BuildServiceOrderCreateInputParams = {
  matchedCustomerId?: string | null;
  matchedDeviceId?: string | null;
  repairDetails: ServiceOrderRepairDetails;
  customerIntake?: ServiceOrderCustomerIntake;
  deviceIntake?: ServiceOrderDeviceIntake;
};

export const buildServiceOrderCreateInput = ({
  matchedCustomerId,
  matchedDeviceId,
  repairDetails,
  customerIntake,
  deviceIntake,
}: BuildServiceOrderCreateInputParams): ServiceOrderCreateInput => {
  if (matchedCustomerId && matchedDeviceId) {
    return {
      mode: "existing-record",
      customerId: matchedCustomerId,
      deviceId: matchedDeviceId,
      repairDetails,
    };
  }

  if (!customerIntake || !deviceIntake) {
    throw new Error(
      "New intake flow requires customer and device intake details.",
    );
  }

  return {
    mode: "new-intake",
    customer: customerIntake,
    device: deviceIntake,
    repairDetails,
  };
};

type BuildCreateRepairJobRequestParams = {
  branchId: string;
  input: ServiceOrderCreateInput;
  newIntakeResolvedIds?: NewIntakeResolvedIds;
};

export const buildCreateRepairJobRequest = ({
  branchId,
  input,
  newIntakeResolvedIds,
}: BuildCreateRepairJobRequestParams): CreateRepairJobRequest => {
  if (input.mode === "existing-record") {
    return {
      customerId: input.customerId,
      deviceId: input.deviceId,
      branchId,
      problemDescription: input.repairDetails.problemDescription,
      estimatedCost: input.repairDetails.estimatedCost,
    };
  }

  if (!newIntakeResolvedIds) {
    throw new Error(
      "New intake flow requires resolved customerId and deviceId before creating a repair job.",
    );
  }

  return {
    customerId: newIntakeResolvedIds.customerId,
    deviceId: newIntakeResolvedIds.deviceId,
    branchId,
    problemDescription: input.repairDetails.problemDescription,
    estimatedCost: input.repairDetails.estimatedCost,
  };
};
