export interface TenantSettings {
  id: string;
  companyName: string;
  subdomain: string;
  logoUrl: string | null;
  subscriptionStatus: string;
  createdAtUtc: string;
}

export interface PublicTenantSettings {
  companyName: string;
  logoUrl: string | null;
}

