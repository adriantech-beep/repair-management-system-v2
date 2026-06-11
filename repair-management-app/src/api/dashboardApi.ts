import type { DashboardStats } from "@/types/dashboard";
import apiClient from "./httpClient";

export async function getDashboardStats(branchId?: string): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>("/api/dashboard/stats", {
    params: branchId ? { branchId } : undefined,
  });
  return response.data;
}
