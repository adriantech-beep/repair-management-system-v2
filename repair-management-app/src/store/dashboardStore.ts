import { create } from "zustand";

interface DashboardState {
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
}

const useDashboardStore = create<DashboardState>((set) => ({
  selectedBranchId: "",
  setSelectedBranchId: (id) => set({ selectedBranchId: id }),
}));

export default useDashboardStore;
