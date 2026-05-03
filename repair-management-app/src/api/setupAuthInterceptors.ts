import { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import apiClient from "./httpClient";
import { refreshTokens } from "./authApi";
import useAuthStore from "@/store/authStore";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let interceptorsConfigured = false;
let refreshPromise: Promise<void> | null = null;

export default function setupAuthInterceptors() {
  if (interceptorsConfigured) {
    return;
  }
  interceptorsConfigured = true;

  apiClient.interceptors.request.use((config) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = "Bearer " + accessToken;
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | RetryableRequestConfig
        | undefined;
      const status = error.response?.status;

      if (!originalRequest || status !== 401 || originalRequest._retry) {
        throw error;
      }

      const isRefreshRequest =
        originalRequest.url?.includes("/api/auth/refresh");
      if (isRefreshRequest) {
        useAuthStore.getState().clearAuth();
        window.location.assign("/login");
        throw error;
      }

      const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();
      if (!refreshToken) {
        clearAuth();
        window.location.assign("/login");
        throw error;
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const refreshed = await refreshTokens(refreshToken);
            setAuth(
              refreshed.accessToken,
              refreshed.refreshToken,
              refreshed.user,
            );
          })().finally(() => {
            refreshPromise = null;
          });
        }

        await refreshPromise;

        const latestAccessToken = useAuthStore.getState().accessToken;
        if (latestAccessToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = "Bearer " + latestAccessToken;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuth();
        window.location.assign("/login");
        throw refreshError;
      }
    },
  );
}
