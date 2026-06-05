import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/services/customerService";
import type { CustomerUpdateInput } from "@/services/customerService";

import { CustomerInput } from "@/lib/validators/customer.schema";
import { User } from "@prisma/client";

/* =========================
   GET CUSTOMERS
========================= */

export function useCustomers() {
  return useQuery<User[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });
}

/* =========================
   CREATE CUSTOMER
========================= */

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerInput) => createCustomer(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

/* =========================
   UPDATE CUSTOMER
========================= */

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerUpdateInput) => updateCustomer(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

/* =========================
   DELETE CUSTOMER
========================= */

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
