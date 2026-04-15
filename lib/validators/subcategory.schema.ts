import { z } from "zod";

const LOCALES = ["EN", "HI", "MR"] as const;

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const localeSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return value.toUpperCase();
}, z.enum(LOCALES));

export const subCategoryTranslationSchema = z.object({
  locale: localeSchema,
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(2).optional()
  ),
});

export const subCategorySchema = z.object({
  slug: z.preprocess(emptyToUndefined, z.string().trim().min(2).optional()),
  imageUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url("Image URL must be a valid URL").optional()
  ),
  isActive: z.boolean().default(true),
  categoryId: z.string().uuid("Category ID must be a valid UUID"),
  hsnCodeId: z.preprocess(
    emptyToUndefined,
    z.string().uuid("HSN Code ID must be a valid UUID").optional()
  ),
  translations: z
    .array(subCategoryTranslationSchema)
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

export type SubCategoryInput = z.infer<typeof subCategorySchema>;
export type SubCategoryTranslationInput = z.infer<typeof subCategoryTranslationSchema>;
