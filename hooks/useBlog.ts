"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiRequest";
import { BlogInput } from "@/lib/validators/blog.schema";

export const useBlogs = () =>
  useQuery({
    queryKey: ["blogs"],
    queryFn: () => apiClient.get("/blogs"),
  });

export const useCreateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BlogInput) =>
      apiClient.post("/blogs", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blogs"] }),
  });
};

export const useUpdateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogInput }) =>
      apiClient.put(`/blogs/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blogs"] }),
  });
};

export const useDeleteBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/blogs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blogs"] }),
  });
};