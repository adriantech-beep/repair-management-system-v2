import { create } from "zustand";

type ServiceOrderWizardStep = 1 | 2 | 3 | 4;

type LookUpStatusState = "idle" | "loading" | "found" | "not-found" | "error";

type ServiceOrderWizardState = {
  currentStep: ServiceOrderWizardStep;
  identifier: string;
  lookUpStatus: LookUpStatusState;
  lookUpMessage?: string | null;
  matchedCustomerId?: string | null;
  matchedCustomerName?: string | null;
  matchedCustomerPhone?: string | null;
  matchedDeviceId?: string | null;
  matchedDeviceLabel?: string | null;
  noIdentifierAvailable: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createJob: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setCreateJob: (job: any | null) => void;
  setNoIdentifierBypass: (branchCode: string) => void;
  setIdentifier: (value: string) => void;
  goToStep: (step: ServiceOrderWizardStep) => void;
  resetWizard: () => void;
  startLookup: () => void;
  completeLookup: (status: LookUpStatusState, message?: string | null) => void;
  setLookupMatch: (
    customerId: string,
    customerName: string,
    customerPhone: string,
    deviceId: string,
    deviceLabel: string,
  ) => void;
  clearLookupMatch: () => void;
};

const initialState = {
  currentStep: 1 as ServiceOrderWizardStep,
  identifier: "",
  lookUpStatus: "idle" as LookUpStatusState,
  lookUpMessage: null,
  matchedCustomerId: null,
  matchedCustomerName: null,
  matchedCustomerPhone: null,
  matchedDeviceId: null,
  matchedDeviceLabel: null,
  noIdentifierAvailable: false,
  createJob: null,
};

const useServiceOrderWizardStore = create<ServiceOrderWizardState>((set) => ({
  ...initialState,
  setIdentifier: (identifier) => set({ identifier }),
  setNoIdentifierBypass: (branchCode) => {
    const cleanBranch = (branchCode || "GEN").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tempTag = `TEMP-${cleanBranch}-${dateStr}-${randomSuffix}`;
    set({
      identifier: tempTag,
      noIdentifierAvailable: true,
      lookUpStatus: "not-found",
      lookUpMessage: "Bypass active. System-generated tracking ID applied.",
      matchedCustomerId: null,
      matchedCustomerName: null,
      matchedCustomerPhone: null,
      matchedDeviceId: null,
      matchedDeviceLabel: null,
    });
  },
  goToStep: (currentStep) => set({ currentStep }),
  resetWizard: () => set(initialState),
  startLookup: () => set({ lookUpStatus: "loading", lookUpMessage: null }),
  completeLookup: (lookUpStatus, lookUpMessage) =>
    set({ lookUpStatus, lookUpMessage }),
  setLookupMatch: (
    customerId,
    customerName,
    customerPhone,
    deviceId,
    deviceLabel,
  ) =>
    set({
      matchedCustomerId: customerId,
      matchedCustomerName: customerName,
      matchedCustomerPhone: customerPhone,
      matchedDeviceId: deviceId,
      matchedDeviceLabel: deviceLabel,
    }),

  clearLookupMatch: () =>
    set({
      matchedCustomerId: null,
      matchedCustomerName: null,
      matchedCustomerPhone: null,
      matchedDeviceId: null,
      matchedDeviceLabel: null,
    }),
  setCreateJob: (createJob) => set({ createJob }),

}));

export default useServiceOrderWizardStore;
