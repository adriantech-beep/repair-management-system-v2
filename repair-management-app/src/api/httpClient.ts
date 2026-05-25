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

export default apiClient;
