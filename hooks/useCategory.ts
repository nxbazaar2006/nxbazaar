"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
} from "@/actions/category";

import type { Category } from "@prisma/client";
import { toast } from "sonner";

/* =========================
TYPES
========================= */

export interface CategoryFormData {
  title: string;
  imageUrl?: string;
  description?: string;
  isActive?: boolean;
}

interface ActionResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}

/* =========================
CREATE CATEGORY
========================= */

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<
    ActionResponse<Category>,
    Error,
    CategoryFormData
  >({
    mutationFn: createCategory,

    /* 🔥 Optimistic UI */
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      const previous = queryClient.getQueryData<Category[]>(["categories"]);

      if (previous) {
        queryClient.setQueryData<Category[]>(["categories"], [
          {
            id: "temp-id",
            title: newCategory.title,
            slug: "temp-slug",
            imageUrl: newCategory.imageUrl ?? null,
            description: newCategory.description ?? null,
            isActive: newCategory.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Category,
          ...previous,
        ]);
      }

      return { previous };
    },

    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["categories"], context.previous);
      }

      toast.error("Create failed ❌");
      console.error("CREATE ERROR:", error);
    },

    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

/* =========================
UPDATE CATEGORY
========================= */

type UpdateCategoryVariables = {
  id: string;
  data: CategoryFormData;
};

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation<
    ActionResponse<Category>,
    Error,
    UpdateCategoryVariables
  >({
    mutationFn: ({ id, data }) => updateCategory(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      const previous = queryClient.getQueryData<Category[]>(["categories"]);

      if (previous) {
        queryClient.setQueryData<Category[]>(
          ["categories"],
          previous.map((cat) =>
            cat.id === id ? { ...cat, ...data } : cat
          )
        );
      }

      return { previous };
    },

    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["categories"], context.previous);
      }

      toast.error("Update failed ❌");
      console.error("UPDATE ERROR:", error);
    },

    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

/* =========================
DELETE CATEGORY
========================= */

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation<
    ActionResponse,
    Error,
    string
  >({
    mutationFn: deleteCategory,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      const previous = queryClient.getQueryData<Category[]>(["categories"]);

      if (previous) {
        queryClient.setQueryData<Category[]>(
          ["categories"],
          previous.filter((cat) => cat.id !== id)
        );
      }

      return { previous };
    },

    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["categories"], context.previous);
      }

      toast.error("Delete failed ❌");
      console.error("DELETE ERROR:", error);
    },

    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

/* =========================
FETCH CATEGORIES
========================= */

export function useCategories(initialData?: Category[]) {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,

    initialData,

    staleTime: 1000 * 60 * 5, // 5 min
    refetchOnWindowFocus: false,
    retry: 1,
  });
}