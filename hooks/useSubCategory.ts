"use client";

import type { SubCategory } from "@/types/subcategory";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import api  from "@/lib/axios";
import type {
  SubCategoryInput,
  UpdateSubCategoryPayload,
} from "@/types/subcategory";

// ✅ CREATE
export function useCreateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubCategoryInput) => {
      const res = await api.post("/subcategories", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
    onError: () => {
      toast.error("Create failed");
    },
  });
}

// ✅ UPDATE
export function useUpdateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateSubCategoryPayload) => {
      const res = await api.put(`/subcategories/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
    onError: () => {
      toast.error("Update failed");
    },
  });
}

// ✅ GET ALL
export function useSubCategories(initialData?: SubCategory[]) {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: async (): Promise<SubCategory[]> => {
      const res = await api.get("/subcategories?locale=en");
      return res.data;
    },
    initialData,
    staleTime: 1000 * 60 * 5, // 🔥 cache 5 min
    retry: 1,
  });
}


// ✅ GET BY TRANSLATION SLUG
export function useSubCategoryBySlug(entitySlug: string, locale = "en") {
  return useQuery({
    queryKey: ["subcategory", locale, entitySlug],
    queryFn: async () => {
      const res = await api.get(`/slugs/subcategory/${locale}/${entitySlug}`);
      return res.data?.data ?? null;
    },
    enabled: Boolean(entitySlug),
    retry: 1,
  });
}
