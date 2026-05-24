import { create } from "zustand";
import type { PreferredContactMethod } from "@/types/inventory";

export type WaitlistDraft = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredContactMethod: PreferredContactMethod;
  notes: string;
};

type PartWaitlistState = {
  activeWaitlistPartId: string | null;
  waitlistDraft: WaitlistDraft;
  waitlistMessage: string | null;
  waitlistError: string | null;
  setActiveWaitlistPartId: (partId: string | null) => void;
  setWaitlistDraft: (draft: Partial<WaitlistDraft>) => void;
  setWaitlistMessage: (msg: string | null) => void;
  setWaitlistError: (err: string | null) => void;
  resetWaitlist: () => void;
};

const emptyWaitlistDraft: WaitlistDraft = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  preferredContactMethod: "Phone",
  notes: "",
};

const initialState = {
  activeWaitlistPartId: null,
  waitlistDraft: emptyWaitlistDraft,
  waitlistMessage: null,
  waitlistError: null,
};

const usePartWaitlistStore = create<PartWaitlistState>((set) => ({
  ...initialState,
  setActiveWaitlistPartId: (activeWaitlistPartId) => set({ activeWaitlistPartId }),
  setWaitlistDraft: (draft) =>
    set((state) => ({
      waitlistDraft: { ...state.waitlistDraft, ...draft },
    })),
  setWaitlistMessage: (waitlistMessage) => set({ waitlistMessage }),
  setWaitlistError: (waitlistError) => set({ waitlistError }),
  resetWaitlist: () => set(initialState),
}));

export default usePartWaitlistStore;
