"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogs,
  getBlogById,
} from "@/lib/actions/blog.actions";
import { BlogInput } from "@/lib/validators/blog.schema";

/* ✅ Blog Type */
type BlogWithRelations = {
  id: string;
  translations?: {
    id: string;
    title: string;
    slug: string;
    locale: string;
  }[];
};

/* ---------------------------------- */
/* ✅ GET ALL */
/* ---------------------------------- */
export function useBlogs() {
  return useQuery<BlogWithRelations[]>({
    queryKey: ["blogs"],
    queryFn: getBlogs,
    staleTime: 1000 * 60 * 5,
  });
}

/* ---------------------------------- */
/* ✅ GET SINGLE */
/* ---------------------------------- */
export function useBlog(id: string) {
  return useQuery<BlogWithRelations>({
    queryKey: ["blog", id],
    queryFn: () => getBlogById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/* ---------------------------------- */
/* ✅ CREATE */
/* ---------------------------------- */
export function useCreateBlog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: BlogInput) => createBlog(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}

/* ---------------------------------- */
/* ✅ UPDATE */
/* ---------------------------------- */
export function useUpdateBlog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogInput }) =>
      updateBlog(id, data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
      qc.invalidateQueries({ queryKey: ["blog", variables.id] });
    },
  });
}

/* ---------------------------------- */
/* ✅ DELETE */
/* ---------------------------------- */
export function useDeleteBlog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBlog(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["blogs"] });

      const previousBlogs = qc.getQueryData<BlogWithRelations[]>(["blogs"]);

      qc.setQueryData<BlogWithRelations[]>(["blogs"], (old = []) =>
        old.filter((blog) => blog.id !== id)
      );

      return { previousBlogs };
    },

    onError: (_err, _id, context) => {
      if (context?.previousBlogs) {
        qc.setQueryData(["blogs"], context.previousBlogs);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}