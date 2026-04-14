"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  createSubCategory,
  deleteSubCategory,
  updateSubCategory,
} from "@/actions/subcategory";
import type { ActionResponse } from "@/types/action-response";
import type {
  SubCategory,
  SubCategoryPayload,
} from "@/types/subcategory";

const SUBCATEGORIES_QUERY_KEY = ["subcategories"] as const;

export function useCreateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, Error, SubCategoryPayload>({
    mutationFn: createSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBCATEGORIES_QUERY_KEY,
      });
    },
  });
}

export function useSubCategories(initialData: SubCategory[] = []) {
  return useQuery<SubCategory[]>({
    queryKey: SUBCATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<SubCategory[]>("/subcategories");
      return data;
    },
    initialData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation<
    ActionResponse,
    Error,
    { id: string; data: SubCategoryPayload }
  >({
    mutationFn: ({ id, data }) => updateSubCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBCATEGORIES_QUERY_KEY,
      });
    },
  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, Error, string>({
    mutationFn: deleteSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBCATEGORIES_QUERY_KEY,
      });
    },
  });
}
