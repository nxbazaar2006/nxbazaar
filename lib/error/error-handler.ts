import axios, { AxiosError } from "axios";

type ApiError = {
  message: string;
  fieldErrors?: Record<string, string[]>;
  statusCode?: number;
};

/* 🔥 Backend response type (no any) */
type ErrorResponse = {
  message?: string;
  errors?: {
    fieldErrors?: Record<string, string[]>;
  };
};

export function getErrorMessage(error: unknown): ApiError {
  // ✅ AXIOS ERROR
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;

    const data = axiosError.response?.data;
    const statusCode = axiosError.response?.status;

    // 🔥 1. ZOD ERROR
    if (data?.errors?.fieldErrors) {
      return {
        message: data.message || "Validation failed",
        fieldErrors: data.errors.fieldErrors,
        statusCode,
      };
    }

    // 🔥 2. BACKEND MESSAGE
    if (data?.message) {
      return {
        message: data.message,
        statusCode,
      };
    }

    // 🔥 3. STRING RESPONSE
    if (typeof data === "string") {
      return {
        message: data,
        statusCode,
      };
    }

    // 🔥 4. NETWORK ERROR
    if (!axiosError.response) {
      return {
        message: "Network error. Please check your internet connection.",
      };
    }

    // 🔥 5. FALLBACK
    return {
      message: "Something went wrong",
      statusCode,
    };
  }

  // ✅ NORMAL ERROR
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // ❌ UNKNOWN
  return {
    message: "Unexpected error occurred",
  };
}