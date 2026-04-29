"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMarket,
  updateMarket,
  deleteMarket,
  getMarkets,
  getMarketById,
} from "@/lib/actions/market.actions";

// ✅ GET ALL
export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    queryFn: getMarkets,
  });
}

// ✅ GET SINGLE
export function useMarket(id: string) {
  return useQuery({
    queryKey: ["market", id],
    queryFn: () => getMarketById(id),
    enabled: !!id,
  });
}

// ✅ CREATE
export function useCreateMarket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createMarket,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}

// ✅ UPDATE
export function useUpdateMarket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateMarket(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["markets"] });
      qc.invalidateQueries({ queryKey: ["market", variables.id] });
    },
  });
}

// ✅ DELETE
export function useDeleteMarket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteMarket,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}