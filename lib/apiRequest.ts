"use client";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

/* ================================
   TYPES
================================ */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/* ================================
   AXIOS INSTANCE
================================ */

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================================
   ERROR HANDLER
================================ */

function handleError(error: unknown): never {
  if (error instanceof AxiosError) {
    const message =
      error.response?.data?.message || "Something went wrong";

    toast.error(message);
    throw new Error(message);
  }

  if (error instanceof Error) {
    toast.error(error.message);
    throw error;
  }

  toast.error("Unknown error");
  throw new Error("Unknown error");
}

/* ================================
   SUCCESS HANDLER
================================ */

function handleSuccess<T>(res: ApiResponse<T>): T {
  if (res.success) {
    toast.success(res.message);
    return res.data;
  }

  throw new Error(res.message);
}

/* ================================
   API METHODS (🔥 MAIN)
================================ */

export const apiClient = {
  /* ===== GET ===== */
  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await api.get<ApiResponse<T>>(url);
      return handleSuccess(data);
    } catch (error) {
      handleError(error);
    }
  },

  /* ===== POST ===== */
  async post<T, P>(url: string, payload: P): Promise<T> {
    try {
      const { data } = await api.post<ApiResponse<T>>(url, payload);
      return handleSuccess(data);
    } catch (error) {
      handleError(error);
    }
  },

  /* ===== PUT ===== */
  async put<T, P>(url: string, payload: P): Promise<T> {
    try {
      const { data } = await api.put<ApiResponse<T>>(url, payload);
      return handleSuccess(data);
    } catch (error) {
      handleError(error);
    }
  },

  /* ===== DELETE ===== */
  async delete<T>(url: string): Promise<T> {
    try {
      const { data } = await api.delete<ApiResponse<T>>(url);
      return handleSuccess(data);
    } catch (error) {
      handleError(error);
    }
  },
};



/* =====================================
   BULK DELETE HOOK
===================================== */
interface BulkDeletePayload {
  endpoint: string;
  ids: string[];
}

export function useApiBulkDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      endpoint,
      ids,
    }: BulkDeletePayload) => {
      const response = await axios.delete(
        `/api/${endpoint}/bulk-delete`,
        {
          data: { ids },
        }
      );

      return response.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [variables.endpoint],
      });
    },
  });
}