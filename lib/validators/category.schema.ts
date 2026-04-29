import { Language } from "@prisma/client";
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
  translations: z
    .array(categoryTranslationSchema)
    .min(1, "At least one translation is required")
    .superRefine((translations, ctx) => {
      const locales = translations.map((item) => item.locale);
      const unique = new Set(locales);

      if (locales.length !== unique.size) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate locales are not allowed",
          path: ["translations"],
        });
      }
    }),
});

export const updateCategorySchema = categorySchema.extend({
  id: z.string().uuid("Category ID must be a valid UUID"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
