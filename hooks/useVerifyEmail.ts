"use client";

import { useMutation } from "@tanstack/react-query";
import axiosClient from "@/lib/axios";

type VerifyEmailPayload = {
  id: string;
  token?: string;
};

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (data: VerifyEmailPayload) => {
      const res = await axiosClient.put("/users/verify", data);
      return res.data;
    },
  });
}
