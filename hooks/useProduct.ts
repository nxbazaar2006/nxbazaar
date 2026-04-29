"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  bulkDeleteProduct,
} from "@/actions/product";

import type { ProductInput } from "@/lib/validators/productSchema";
import type { ProductWithRelations } from "@/types/product";

/* ================= GET ================= */
export const useProducts = () => {
  return useQuery<ProductWithRelations[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts();
      if (!res.success) throw new Error(res.error);
      return res.data.data;
    },
  });
};

/* ================= CREATE ================= */
export const useCreateProduct = () => {
  const qc = useQueryClient();

  return useMutation<ProductWithRelations, Error, ProductInput>({
    mutationFn: async (data) => {
      const res = await createProduct(data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

/* ================= UPDATE ================= */
export const useUpdateProduct = () => {
  const qc = useQueryClient();

  return useMutation<
    ProductWithRelations,
    Error,
    { id: string; data: ProductInput }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await updateProduct(id, data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

/* ================= DELETE ================= */
export const useDeleteProduct = () => {
  const qc = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await deleteProduct(id);
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

/* ================= BULK DELETE ================= */
export const useBulkDeleteProducts = () => {
  const qc = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: async (ids) => {
      const res = await bulkDeleteProduct(ids);
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
