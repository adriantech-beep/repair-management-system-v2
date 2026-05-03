import axios from "axios";

export type ApiError = {
  message: string;
  fieldErrors: Record<string, string[]> | null;
  status: number | null;
};

export default function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        message: "Cannot reach the server. Check your connection.",
        fieldErrors: null,
        status: null,
      };
    }

    const message =
      error.response?.data?.message ?? "An unknown error occurred";
    const fieldErrors = error.response?.data?.errors ?? null;
    const status = error.response?.status ?? null;
    return { message, fieldErrors, status };
  } else {
    return {
      message: "An unknown error occurred",
      fieldErrors: null,
      status: null,
    };
  }
}
