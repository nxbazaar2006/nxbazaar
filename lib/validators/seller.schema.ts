import { z } from "zod";

export const SellerSchema = z.object({
  code: z.string().optional(),

  contactPerson: z.string().min(2, "Contact person is required"),

  contactPersonPhone: z
    .string()
    .min(10, "Phone must be at least 10 digits"),

  email: z.string().email("Invalid email"),

  name: z.string().min(2, "Name is required"),

  notes: z.string().optional(),

  phone: z.string().min(10, "Phone is required"),

  physicalAddress: z.string().min(5, "Address is required"),

  isActive: z.boolean().default(true),

  profileImageUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),

  // 🔥 FIX: string → number transform
  turnover: z
    .string()
    .min(1, "Land size is required")
    .transform((val) => Number(val)),

  mainProduct: z.string().optional(),

  userId: z.string().uuid("Invalid User ID").optional(),
});

export type SellerInput = z.infer<typeof SellerSchema>;
