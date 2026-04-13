import { z } from "zod";

/* ================================
   CONSTANTS / ENUMS
================================ */

export const LOCALES = ["EN", "HI", "MR"] as const;

export const localeEnum = z.enum(LOCALES);

/* ================================
   HELPERS
================================ */

// Empty string → undefined (form handling के लिए बहुत जरूरी)
const optionalString = () =>
  z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional();

const requiredString = (field: string, min = 2) =>
  z
    .string()
    .trim()
    .min(min, `${field} must be at least ${min} characters`);

/* ================================
   TRANSLATION SCHEMA
================================ */

export const subCategoryTranslationSchema = z.object({
  locale: localeEnum,

  title: requiredString("Title", 2),

  description: optionalString(),
});

/* ================================
   MAIN SUBCATEGORY SCHEMA
================================ */

export const subCategorySchema = z.object({
  id: z.string().uuid().optional(),

  slug: optionalString(), // auto-generate backend पे होगा

  imageUrl: optionalString(),

  isActive: z.boolean().default(true),

  categoryId: requiredString("Category", 1),

  hsnCodeId: optionalString().nullable(),

  // SEO Fields
  metaTitle: optionalString(),
  metaDescription: optionalString(),

  translations: z
    .array(subCategoryTranslationSchema)
    .min(1, "At least one translation required")
    .superRefine((translations, ctx) => {
      const locales = translations.map((t) => t.locale);

      const uniqueLocales = new Set(locales);

      if (locales.length !== uniqueLocales.size) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate locales are not allowed",
        });
      }
    }),
});

/* ================================
   TYPES
================================ */

export type SubCategoryInput = z.infer<typeof subCategorySchema>;

export type SubCategoryTranslationInput = z.infer<
  typeof subCategoryTranslationSchema
>;