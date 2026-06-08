import type { TenantSettings, PublicTenantSettings } from "@/types/tenant";
import apiClient from "./httpClient";

export async function getTenantSettings(): Promise<TenantSettings> {
  const response = await apiClient.get<TenantSettings>("/api/tenant");
  return response.data;
}

export async function getPublicTenantSettings(): Promise<PublicTenantSettings> {
  const response = await apiClient.get<PublicTenantSettings>("/api/tenant/public");
  return response.data;
}

export async function updateTenantSettings(companyName: string): Promise<void> {
  await apiClient.put("/api/tenant", { companyName });
}

export async function uploadTenantLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<{ logoUrl: string }>(
    "/api/tenant/logo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.logoUrl;
}
