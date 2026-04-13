import axios, { AxiosError } from "axios";

type ApiError = {
  message: string;
  fieldErrors?: Record<string, string[]>;
  statusCode?: number;
};

export function getErrorMessage(error: unknown): ApiError {
  // ✅ AXIOS ERROR (API CALL FAILED)
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    const data = axiosError.response?.data;
    const statusCode = axiosError.response?.status;

    // 🔥 1. ZOD VALIDATION ERROR (BEST CASE)
    if (data?.errors?.fieldErrors) {
      return {
        message: data.message || "Validation failed",
        fieldErrors: data.errors.fieldErrors,
        statusCode,
      };
    }

    // 🔥 2. STANDARD BACKEND ERROR (message)
    if (data?.message) {
      return {
        message: data.message,
        statusCode,
      };
    }

    // 🔥 3. STRING ERROR FORMAT (rare APIs)
    if (typeof data === "string") {
      return {
        message: data,
        statusCode,
      };
    }

    // 🔥 4. NETWORK ERROR (no response)
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

  // ✅ NORMAL JS ERROR
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // ❌ UNKNOWN ERROR
  return {
    message: "Unexpected error occurred",
  };
}