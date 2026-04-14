import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const blogSchema = z.object({
  slug: z.string().min(3),
  imageUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("Image URL must be valid").optional()
  ),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  content: z.unknown(),
  userId: z.preprocess(emptyToUndefined, z.string().optional()),
  categoryId: z.preprocess(emptyToUndefined, z.string().optional()),

  translations: z.array(
    z.object({
      locale: z.preprocess(
        (value) =>
          typeof value === "string" ? value.toLowerCase() : value,
        z.enum(["en", "hi", "mr"])
      ),
      title: z.string().min(3),
      description: z.preprocess(emptyToUndefined, z.string().optional()),
      metaTitle: z.preprocess(emptyToUndefined, z.string().optional()),
      metaDescription: z.preprocess(emptyToUndefined, z.string().optional()),
    })
  ).min(1),
});

export type BlogInput = z.infer<typeof blogSchema>;
