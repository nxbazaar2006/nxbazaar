// hooks/useCategory.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/category";
import type { CategoryInput } from "@/lib/validators/category.schema";

export function useCreateCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryInput) => {
      const res = await createCategory(data);
      if ("error" in res) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryInput) => {
      const res = await updateCategory(id, data);
      if ("error" in res) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return deleteCategory(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}