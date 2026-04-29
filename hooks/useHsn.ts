"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

type HsnResponse = {
  data: {
    id: string;
    code: string;
    title: string;
  }[];
  nextPage?: number | null;
};

export const useHsn = (search: string) => {
  return useInfiniteQuery<HsnResponse>({
    queryKey: ["hsn", search],

    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(
        `/hsn?search=${search}&page=${pageParam}`
      );
      return res.data;
    },

    initialPageParam: 1,

    // ✅ REQUIRED (warna error वही रहेगा)
    getNextPageParam: (lastPage) => {
      return lastPage?.nextPage ?? undefined;
    },
  });
};