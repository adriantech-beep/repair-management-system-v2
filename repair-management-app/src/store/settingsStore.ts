import { create } from "zustand";

interface SettingsState {
  companyName: string;
  file: File | null;
  filePreview: string | null;
  generalError: string | null;
  successMessage: string | null;

  setCompanyName: (companyName: string) => void;
  setFile: (file: File | null) => void;
  setFilePreview: (filePreview: string | null) => void;
  setGeneralError: (generalError: string | null) => void;
  setSuccessMessage: (successMessage: string | null) => void;
  reset: () => void;
}

const useSettingsStore = create<SettingsState>((set) => ({
  companyName: "",
  file: null,
  filePreview: null,
  generalError: null,
  successMessage: null,

  setCompanyName: (companyName) => set({ companyName }),
  setFile: (file) => set({ file }),
  setFilePreview: (filePreview) => set({ filePreview }),
  setGeneralError: (generalError) => set({ generalError }),
  setSuccessMessage: (successMessage) => set({ successMessage }),
  reset: () => set({
    companyName: "",
    file: null,
    filePreview: null,
    generalError: null,
    successMessage: null,
  }),
}));

export default useSettingsStore;
