"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useBulkDelete(
  mutationFn: (ids: string[]) => Promise<unknown>,
  queryKey: string[]
) {

  const queryClient = useQueryClient()

  return useMutation({

    mutationFn,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey,
      })
    },

  })
}
