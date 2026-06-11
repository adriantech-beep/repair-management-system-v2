import type { Branch } from "@/types/branch";
import apiClient from "./httpClient";

export async function getBranches(): Promise<Branch[]> {
  const response = await apiClient.get<Branch[]>("/api/branches");
  return response.data;
}
