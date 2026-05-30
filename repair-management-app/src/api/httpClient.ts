import axios from "axios";
import type { AuthUser } from "@/types/user";

// Unified with our backend DTO shape
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5252",
});

// Dynamic Tenant Subdomain Interceptor
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const hostParts = host.split(".");
    
    // Extract subdomain if running on a custom tenant subdomain (e.g. shopa.atechlabs.it.com -> shopa)
    if (hostParts.length > 2 && hostParts[0] !== "www" && hostParts[0] !== "api") {
      config.headers["X-Tenant-Subdomain"] = hostParts[0].toLowerCase();
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
