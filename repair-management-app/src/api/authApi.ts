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
