import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/category";
import type { CategoryInput } from "@/lib/validators/category.schema";

/* ---------------------------------- */
/* ✅ COMMON ERROR HANDLER */
/* ---------------------------------- */
function handleResponse<T>(res: { data?: T; error?: string }): T {
  if (res.error) throw new Error(res.error);
  return res.data as T;
}

/* ---------------------------------- */
/* ✅ CREATE */
/* ---------------------------------- */
export function useCreateCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryInput) =>
      createCategory(data).then(handleResponse),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

/* ---------------------------------- */
/* ✅ UPDATE */
/* ---------------------------------- */
export function useUpdateCategory(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryInput) =>
      updateCategory(id, data).then(handleResponse),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["category", id] }); 
    },
  });
}

/* ---------------------------------- */
/* ✅ DELETE */
/* ---------------------------------- */
export function useDeleteCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}