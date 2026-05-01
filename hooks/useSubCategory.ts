"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  SubCategory,
  SubCategoryInput,
  UpdateSubCategoryPayload,
} from "@/types/subcategory";

import api from "@/lib/axios";
import { apiRequest } from "@/lib/api-client";

/* ================= KEYS ================= */
export const subCategoryKeys = {
  all: ["subcategories"] as const,
};

/* ================= CREATE ================= */
export function useCreateSubCategory() {
  const qc = useQueryClient();

  return useMutation<SubCategory, Error, SubCategoryInput>({
    mutationFn: (data) =>
      apiRequest(api.post("/subcategories", data)),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subCategoryKeys.all });
      toast.success("SubCategory created");
    },

    onError: (err) => {
      toast.error(err.message || "Create failed");
    },
  });
}

/* ================= UPDATE ================= */
export function useUpdateSubCategory() {
  const qc = useQueryClient();

  return useMutation<
    SubCategory,
    Error,
    UpdateSubCategoryPayload
  >({
    mutationFn: ({ id, data }) =>
      apiRequest(api.put(`/subcategories/${id}`, data)),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: subCategoryKeys.all });
      qc.invalidateQueries({
        queryKey: ["subcategory", variables.id],
      });

      toast.success("Updated successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Update failed");
    },
  });
}

/* ================= GET ================= */
export function useSubCategories(initialData?: SubCategory[]) {
  return useQuery<SubCategory[]>({
    queryKey: subCategoryKeys.all,

    queryFn: () =>
      apiRequest<SubCategory[]>(
        api.get("/subcategories?locale=EN")
      ),

    initialData,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}