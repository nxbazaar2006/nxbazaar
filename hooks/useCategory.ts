"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/actions/category";
import type { Category, CategoryFormData } from "@/types/category";
import type { ActionResponse } from "@/types/action-response";

const CATEGORIES_QUERY_KEY = ["categories"] as const;

async function fetchCategories(locale?: string): Promise<Category[]> {
  const query = locale ? `?locale=${locale}` : "";
  const { data } = await api.get<Category[]>(`/categories${query}`);
  return data;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse<Category>, Error, CategoryFormData>({
    mutationFn: createCategory,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

type UpdateCategoryVariables = {
  id: string;
  data: CategoryFormData;
};

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse<Category>, Error, UpdateCategoryVariables>({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, Error, string>({
    mutationFn: deleteCategory,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useCategories(locale?: string, initialData?: Category[]) {
  return useQuery<Category[]>({
    queryKey: [...CATEGORIES_QUERY_KEY, locale],
    queryFn: () => fetchCategories(locale),
    initialData,
    staleTime: 1000 * 60 * 5,
  });
}
