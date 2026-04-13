"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ProductRequest,
  CreateProductInput,
  UpdateProductInput,
  Product,
} from "@/types/product";

import { productSchema } from "@/lib/validators/productSchema";

/* ================= GET ALL ================= */

export function useProducts() {
  return useQuery<ProductRequest[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get("/api/products");
      return res.data;
    },
  });
}

/* ================= GET ONE ================= */

export function useProductBySlug(slug: string, initialData?: Product) {
  return useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await axios.get(`/api/products/${slug}`);
      return ProductSchema.parse(res.data);
    },
    initialData,
  });
}

/* ================= CREATE ================= */

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<ProductRequest, Error, CreateProductInput>({
    mutationFn: async (data) => {
      const res = await axios.post("/api/products", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/* ================= UPDATE ================= */

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation<
    ProductRequest,
    Error,
    { id: string; data: UpdateProductInput }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await axios.put(`/api/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/* ================= DELETE ================= */

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<ProductRequest, Error, string>({
    mutationFn: async (id) => {
      const res = await axios.delete(`/api/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}