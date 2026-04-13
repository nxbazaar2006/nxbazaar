"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/* ================================
   BASE MUTATION
================================ */

function useAppMutation<TData = any, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<any>,
  queryKey: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message || "Success");
        queryClient.invalidateQueries({ queryKey });
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error?.message || "Something went wrong");
    },
  });
}

/* ================================
   CREATE
================================ */

export function useCreateSubCategory() {
  return useAppMutation(async (data: any) => {
    const res = await fetch("/api/subcategories", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  }, ["subcategories"]);
}

/* ================================
   GET
================================ */

export function useSubCategories(initialData: any[] = []) {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const res = await fetch("/api/subcategories");
      return res.json();
    },
    initialData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSubCategory() {
  return useAppMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/subcategories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    ["subcategories"]
  );
}