// lib/validators/category.schema.ts
import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const localeSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return value.toUpperCase();
}, z.nativeEnum(Language));

export const categoryTranslationSchema = z.object({
  locale: localeSchema,
  slug: z.preprocess(emptyToUndefined, z.string().trim().min(2).optional()),
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(2).optional()
  ),
});

export const categorySchema = z.object({
  slug: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(2).optional()
  ),
  imageUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url("Image URL must be a valid URL").optional()
  ),
  isActive: z.boolean().default(true),
  locale: z.enum(["EN", "HI", "MA"]), // 👈 Language enum match
});

export type CategoryInput = z.infer<typeof CategorySchema>;