"use client";

import {
  useApiGet,
  useApiPost,
  useApiPut,
  useApiDelete,
  useApiBulkDelete,
} from "@/lib/apiRequest";

import { Market } from "@/types/market";
import { MarketInput } from "@/schemas/market";

export const MARKET_QUERY_KEY = ["markets"] as const;

/* ================================
   GET ALL
================================ */
export function useMarkets() {
  return useApiGet<Market[]>("/markets", MARKET_QUERY_KEY);
}

/* ================================
   GET SINGLE
================================ */
export function useMarketById(id: string) {
  return useApiGet<Market>(`/markets/${id}`, ["markets", id]);
}

/* ================================
   CREATE
================================ */
export function useCreateMarketApi() {
  return useApiPost<Market, MarketInput>(
    "/markets",
    MARKET_QUERY_KEY
  );
}

/* ================================
   UPDATE
================================ */
export function useUpdateMarketApi() {
  return useApiPut<Market, { id: string; data: MarketInput }>(
    "/markets",
    MARKET_QUERY_KEY
  );
}

/* ================================
   DELETE
================================ */
export function useDeleteMarket() {
  return useApiDelete<Market>(
    "/markets",
    MARKET_QUERY_KEY
  );
}

/* ================================
   BULK DELETE
================================ */
export function useBulkDeleteMarket() {
  return useApiBulkDelete<Market>(
    "/markets",
    MARKET_QUERY_KEY
  );
}