// lib/validators/category.schema.ts
import { z } from "zod";

export const CategorySchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  locale: z.enum(["EN", "HI", "MA"]), // 👈 Language enum match
});

export type CategoryInput = z.infer<typeof CategorySchema>;