"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogs,
  getBlogById,
} from "@/lib/actions/blog.actions";

// ✅ GET ALL
export function useBlogs() {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: getBlogs,
  });
}

// ✅ GET SINGLE
export function useBlog(id: string) {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlogById(id),
    enabled: !!id,
  });
}

// ✅ CREATE
export function useCreateBlog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}

// ✅ UPDATE
export function useUpdateBlog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateBlog(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
      qc.invalidateQueries({ queryKey: ["blog", variables.id] });
    },
  });
}

// ✅ DELETE
export function useDeleteBlog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}