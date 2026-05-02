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
import { unwrap } from "@/lib/api-helper";

/* ================= QUERY KEYS ================= */
export const productKeys = {
  all: ["products"] as const,
};

/* ================= GET ================= */
export const useProducts = () => {
  return useQuery<ProductWithRelations[]>({
    queryKey: productKeys.all,
    queryFn: async () => {
      return unwrap<ProductWithRelations[]>(getProducts());
    },
    staleTime: 1000 * 60 * 5,
  });
};

/* ================= CREATE ================= */
export const useCreateProduct = () => {
  const qc = useQueryClient();

  return useMutation<ProductWithRelations, Error, ProductInput>({
    mutationFn: (data) => unwrap(createProduct(data)),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
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
    mutationFn: ({ id, data }) =>
      unwrap(updateProduct(id, data)),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

/* ================= DELETE (Optimistic) ================= */
export const useDeleteProduct = () => {
  const qc = useQueryClient();

  return useMutation<void, Error, string, { prev?: ProductWithRelations[] }>({
    mutationFn: async (id) => {
      await unwrap(deleteProduct(id));
    },

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: productKeys.all });

      const prev = qc.getQueryData<ProductWithRelations[]>(
        productKeys.all
      );

      qc.setQueryData<ProductWithRelations[]>(productKeys.all, (old = []) =>
        old.filter((p) => p.id !== id)
      );

      return { prev };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(productKeys.all, ctx.prev);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

/* ================= BULK DELETE (Optimistic) ================= */
export const useBulkDeleteProducts = () => {
  const qc = useQueryClient();

  return useMutation<void, Error, string[], { prev?: ProductWithRelations[] }>({
    mutationFn: async (ids) => {
      await unwrap(bulkDeleteProduct(ids));
    },

    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: productKeys.all });

      const prev = qc.getQueryData<ProductWithRelations[]>(
        productKeys.all
      );

      qc.setQueryData<ProductWithRelations[]>(productKeys.all, (old = []) =>
        old.filter((p) => !ids.includes(p.id))
      );

      return { prev };
    },

    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(productKeys.all, ctx.prev);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
