import axios, { AxiosError} from "axios";

/* ================= AXIOS INSTANCE ================= */
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= TYPES ================= */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ================= HANDLERS ================= */
function handleSuccess<T>(res: ApiResponse<T> | T): T {
  if (
    res &&
    typeof res === "object" &&
    "success" in res
  ) {
    const response = res as ApiResponse<T>;

    if (response.success) return response.data;
    throw new Error(response.message);
  }

  return res as T;
}

function handleError(error: unknown): never {
  if (error instanceof AxiosError) {
    throw new Error(
      error.response?.data?.message || "API Error"
    );
  }

  if (error instanceof Error) throw error;

  throw new Error("Unknown error");
}

/* ================= API CLIENT ================= */
export const apiClient = {
  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await api.get<ApiResponse<T> | T>(url);
      return handleSuccess(data);
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  async post<T, P>(url: string, payload: P): Promise<T> {
    try {
      const { data } = await api.post<ApiResponse<T> | T>(url, payload);
      return handleSuccess(data);
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  async put<T, P>(url: string, payload: P): Promise<T> {
    try {
      const { data } = await api.put<ApiResponse<T> | T>(url, payload);
      return handleSuccess(data);
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  async delete<T>(url: string): Promise<T> {
    try {
      const { data } = await api.delete<ApiResponse<T> | T>(url);
      return handleSuccess(data);
    } catch (error: unknown) {
      return handleError(error);
    }
  },
};
