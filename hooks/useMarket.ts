"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMarket,
  updateMarket,
  deleteMarket,
  getMarkets,
  getMarketById,
} from "@/lib/actions/market.actions";
import { MarketInput } from "@/lib/validators/market.schema";

/* ✅ TYPE */
type MarketWithRelations = {
  id: string;
  logoUrl?: string;
  isActive?: boolean;
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
export function useMarkets() {
  return useQuery<MarketWithRelations[]>({
    queryKey: ["markets"],
    queryFn: getMarkets,
    staleTime: 1000 * 60 * 5,
  });
}

/* ---------------------------------- */
/* ✅ GET SINGLE */
/* ---------------------------------- */
export function useMarket(id: string) {
  return useQuery<MarketWithRelations>({
    queryKey: ["market", id],
    queryFn: () => getMarketById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/* ---------------------------------- */
/* ✅ CREATE */
/* ---------------------------------- */
export function useCreateMarket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: MarketInput) => createMarket(data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}

/* ---------------------------------- */
/* ✅ UPDATE */
/* ---------------------------------- */
export function useUpdateMarket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarketInput }) =>
      updateMarket(id, data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["markets"] });
      qc.invalidateQueries({ queryKey: ["market", variables.id] });
    },
  });
}

/* ---------------------------------- */
/* ✅ DELETE (Optimistic) */
/* ---------------------------------- */
export function useDeleteMarket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMarket(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["markets"] });

      const previous = qc.getQueryData<MarketWithRelations[]>(["markets"]);

      qc.setQueryData<MarketWithRelations[]>(["markets"], (old = []) =>
        old.filter((item) => item.id !== id)
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(["markets"], context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}