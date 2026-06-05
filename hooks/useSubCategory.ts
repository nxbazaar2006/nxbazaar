"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  SubCategory,
  SubCategoryInput,
  UpdateSubCategoryPayload,
} from "@/types/subcategory";

import { apiClient } from "@/lib/api-client";

/* ================= KEYS ================= */
export const subCategoryKeys = {
  all: ["subcategories"] as const,
};

/* ================= CREATE ================= */
export function useCreateSubCategory() {
  const qc = useQueryClient();

  return useMutation<SubCategory, Error, SubCategoryInput>({
    mutationFn: (data) =>
      apiClient.post<SubCategory, SubCategoryInput>(
        "/subcategories",
        data
      ),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subCategoryKeys.all });
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
      apiClient.put<SubCategory, SubCategoryInput>(
        `/subcategories/${id}`,
        data
      ),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: subCategoryKeys.all });
      qc.invalidateQueries({
        queryKey: ["subcategory", variables.id],
      });
    },
  });
}

/* ================= GET ================= */
export function useSubCategories(initialData?: SubCategory[]) {
  return useQuery<SubCategory[]>({
    queryKey: subCategoryKeys.all,

    queryFn: () =>
      apiClient.get<SubCategory[]>(
        "/subcategories?locale=EN"
      ),

    initialData,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}


// ✅ GET BY TRANSLATION SLUG
export function useSubCategoryBySlug(entitySlug: string, locale = "en") {
  return useQuery({
    queryKey: ["subcategory", locale, entitySlug],
    queryFn: async () => {
      return apiClient.get<SubCategory | null>(
        `/slugs/subcategory/${locale}/${entitySlug}`
      );
    },
    enabled: Boolean(entitySlug),
    retry: 1,
  });
}
