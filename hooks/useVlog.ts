"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { apiClient } from "@/lib/apiRequest";
import { VlogInput } from "@/lib/validators/vlog.schema";
import type { Vlog } from "@/types/vlog";
import { toast } from "sonner";

/* ================= KEYS ================= */
export const vlogKeys = {
  all: ["vlogs"] as const,
  single: (id: string) => ["vlog", id] as const,
};

/* ================= GET ================= */
export const useVlogs = () =>
  useQuery<Vlog[]>({
    queryKey: vlogKeys.all,
    queryFn: () => apiClient.get<Vlog[]>("/vlogs"),
    staleTime: 1000 * 60 * 5,
  });

/* ================= CREATE ================= */
export const useCreateVlog = () => {
  const qc = useQueryClient();

  return useMutation<Vlog, Error, VlogInput>({
    mutationFn: (data) =>
      apiClient.post<Vlog, VlogInput>("/vlogs", data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vlogKeys.all });
      toast.success("Vlog created");
    },

    onError: (err) => {
      toast.error(err.message || "Create failed");
    },
  });
};

/* ================= UPDATE ================= */
export const useUpdateVlog = () => {
  const qc = useQueryClient();

  return useMutation<
    Vlog,
    Error,
    { id: string; data: VlogInput }
  >({
    mutationFn: ({ id, data }) =>
      apiClient.put<Vlog, VlogInput>(`/vlogs/${id}`, data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: vlogKeys.all });
      qc.invalidateQueries({
        queryKey: vlogKeys.single(variables.id),
      });

      toast.success("Updated");
    },

    onError: (err) => {
      toast.error(err.message || "Update failed");
    },
  });
};

/* ================= DELETE (Optimistic) ================= */
export const useDeleteVlog = () => {
  const qc = useQueryClient();

  return useMutation<void, Error, string, { prev?: Vlog[] }>({
    mutationFn: (id) =>
      apiClient.delete<void>(`/vlogs/${id}`),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: vlogKeys.all });

      const prev = qc.getQueryData<Vlog[]>(vlogKeys.all);

      qc.setQueryData<Vlog[]>(vlogKeys.all, (old = []) =>
        old.filter((v) => v.id !== id)
      );

      return { prev };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(vlogKeys.all, ctx.prev);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: vlogKeys.all });
    },
  });
};
