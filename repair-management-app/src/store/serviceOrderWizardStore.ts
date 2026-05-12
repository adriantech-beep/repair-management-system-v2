import { create } from "zustand";

type ServiceOrderWizardStep = 1 | 2;

type LookUpStatusState = "idle" | "loading" | "found" | "not-found" | "error";

type ServiceOrderWizardState = {
  currentStep: ServiceOrderWizardStep;
  identifier: string;
  lookUpStatus: LookUpStatusState;
  lookUpMessage?: string | null;
  matchedCustomerId?: string | null;
  matchedCustomerName?: string | null;
  matchedDeviceId?: string | null;
  matchedDeviceLabel?: string | null;
  setIdentifier: (value: string) => void;
  goToStep: (step: ServiceOrderWizardStep) => void;
  resetWizard: () => void;
  startLookup: () => void;
  completeLookup: (status: LookUpStatusState, message?: string | null) => void;
  setLookupMatch: (
    customerId: string,
    customerName: string,
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
  matchedDeviceId: null,
  matchedDeviceLabel: null,
};

const useServiceOrderWizardStore = create<ServiceOrderWizardState>((set) => ({
  ...initialState,
  setIdentifier: (identifier) => set({ identifier }),
  goToStep: (currentStep) => set({ currentStep }),
  resetWizard: () => set(initialState),
  startLookup: () => set({ lookUpStatus: "loading", lookUpMessage: null }),
  completeLookup: (lookUpStatus, lookUpMessage) =>
    set({ lookUpStatus, lookUpMessage }),
  setLookupMatch: (customerId, customerName, deviceId, deviceLabel) =>
    set({
      matchedCustomerId: customerId,
      matchedCustomerName: customerName,
      matchedDeviceId: deviceId,
      matchedDeviceLabel: deviceLabel,
    }),
  clearLookupMatch: () =>
    set({
      matchedCustomerId: null,
      matchedCustomerName: null,
      matchedDeviceId: null,
      matchedDeviceLabel: null,
      resetWizard: () => set(initialState),
    }),
}));

export default useServiceOrderWizardStore;
