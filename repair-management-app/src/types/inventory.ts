export const preferredContactMethods = ["Email", "Phone"] as const;

export type PreferredContactMethod = (typeof preferredContactMethods)[number];

export const waitlistStatuses = [
  "Pending",
  "Notified",
  "Resolved",
  "Cancelled",
] as const;

export type WaitlistStatus = (typeof waitlistStatuses)[number];

export type PartCompatibility = {
  id: string;
  brand: string;
  modelName: string;
};

export type PartResponse = {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  stockQuantity: number;
  supplierPrice: number;
  sellingPrice: number;
  isActive: boolean;
  compatibilities: PartCompatibility[];
};

export type GetPartsParams = {
  search?: string;
  category?: string;
  inStockOnly?: boolean;
};

export type CreateWaitlistRequest = {
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  preferredContactMethod: PreferredContactMethod;
  notes: string | null;
};

export type WaitlistResponse = {
  id: string;
  partId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  preferredContactMethod: PreferredContactMethod;
  status: WaitlistStatus;
  createdAtUtc: string;
  notifiedAtUtc: string | null;
  resolvedAtUtc: string | null;
  notes: string | null;
};
