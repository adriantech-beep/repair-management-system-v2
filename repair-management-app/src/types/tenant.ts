import type { DeviceType } from "./device";

export interface TenantSettings {
  id: string;
  companyName: string;
  subdomain: string;
  logoUrl: string | null;
  subscriptionStatus: string;
  createdAtUtc: string;
  contactNumber: string | null;
  website: string | null;
  businessNumber: string | null;
}

export interface PublicTenantSettings {
  companyName: string;
  logoUrl: string | null;
  contactNumber: string | null;
  website: string | null;
  businessNumber: string | null;
}

export interface IntakeSuccessScreenProps {
  createdJob: {
    id: string;
    jobNumber: string;
    createdAtUtc: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
    customerAddress?: string | null;
    deviceBrand: string;
    deviceModel: string;
    deviceType: DeviceType;
    imeiOrSerialNumber: string | null;
    problemDescription: string;
    estimatedCost: number | null;
  };
  onReset: () => void;
}