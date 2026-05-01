import { z } from "zod";

export const orderItemSchema = z.object({
  id: z.string(),
  productVariantId: z.string().optional(),
  title: z.string().optional(),
  imageUrl: z.string().optional(),
  qty: z.coerce.number().int().min(1),
  salePrice: z.coerce.number().min(0).optional(),
  vendorId: z.string().optional(),
});

export const checkoutSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  streetAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  district: z.string().optional(),
  country: z.string().min(1),
  zip: z.string().optional(),
  paymentMethod: z.string(),
  shippingCost: z.coerce.number().min(0).default(0),
  userId: z.string().optional(),
});

export const createOrderSchema = z.object({
  checkoutFormData: checkoutSchema,
  orderItems: z.array(orderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
