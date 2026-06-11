import type { AuthUser } from "@/types/user";
import apiClient, { type LoginResponse } from "./httpClient";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function logout(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await apiClient.post(
    "/api/auth/logout",
    { refreshToken },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}

export async function refreshTokens(
  refreshToken: string,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/auth/refresh", {
    refreshToken,
  });
  return response.data;
}

export async function getUsers(role?: string): Promise<AuthUser[]> {
  const response = await apiClient.get<AuthUser[]>("/api/auth/users", {
    params: role ? { role } : undefined,
  });
  return response.data;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
  branchId: string;
}

export async function createUser(data: CreateUserRequest): Promise<AuthUser> {
  const response = await apiClient.post<AuthUser>("/api/auth/users", data);
  return response.data;
}


