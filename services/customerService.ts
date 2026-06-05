import api  from "@/lib/axios";
import { CustomerInput } from "@/lib/validators/customer.schema";

export type CustomerUpdateInput = CustomerInput & {
  id: string;
};

export async function getCustomers() {
  const res = await api.get("/customers");
  return res.data;
}

export async function createCustomer(data: CustomerInput) {
  const res = await api.post("/customers", data);
  return res.data;
}

export async function updateCustomer(data: CustomerUpdateInput) {
  const { id, ...payload } = data;
  const res = await api.put(`/customers/${id}`, payload);
  return res.data;
}

export async function deleteCustomer(id: string) {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
}
