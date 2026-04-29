"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiRequest";
import { VlogInput } from "@/lib/validators/vlog.schema";

export const useVlogs = () =>
  useQuery({
    queryKey: ["vlogs"],
    queryFn: () => apiClient.get("/vlogs"),
  });

export const useCreateVlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VlogInput) =>
      apiClient.post("/vlogs", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vlogs"] }),
  });
};

export const useUpdateVlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VlogInput }) =>
      apiClient.put(`/vlogs/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vlogs"] }),
  });
};

export const useDeleteVlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/vlogs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vlogs"] }),
  });
};