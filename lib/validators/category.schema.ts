import { z } from "zod";
import { Language } from "@prisma/client";

/* ================================
   HELPERS
================================ */

const optionalString = () =>
  z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional();

const requiredString = (field: string, min = 2) =>
  z.string().trim().min(min, `${field} must be at least ${min} characters`);

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/* ================================
   TRANSLATION SCHEMA
================================ */

export const categoryTranslationSchema = z.object({
  locale: z.nativeEnum(Language), // ✅ DB synced enum

  title: requiredString("Title", 2),

  description: optionalString(),
});

/* ================================
   BASE CATEGORY SCHEMA
================================ */

const baseCategorySchema = z.object({
  id: z.string().optional(),

  title: requiredString("Title", 2),

  slug: optionalString(), // auto generate होगा

  imageUrl: optionalString(),

  description: optionalString(),

  isActive: z.boolean().default(true),

  position: z.number().default(0),

  translations: z
    .array(categoryTranslationSchema)
    .optional()
    .superRefine((translations, ctx) => {
      if (!translations) return;

      const locales = translations.map((t) => t.locale);
      const unique = new Set(locales);

      if (locales.length !== unique.size) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate locales not allowed",
        });
      }
    }),
});

/* ================================
   MAIN SCHEMA (API)
================================ */

export const categorySchema = baseCategorySchema.transform((data) => ({
  ...data,
  slug: data.slug || generateSlug(data.title),
}));

/* ================================
   FORM SCHEMA (FRONTEND)
================================ */

export const categoryFormSchema = baseCategorySchema.omit({
  slug: true,
});

/* ================================
   UPDATE SCHEMA
================================ */

export const updateCategorySchema = categorySchema.extend({
  id: z.string().min(1, "Category ID required"),
});

/* ================================
   TYPES
================================ */

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

/* ================================
   VALIDATION HELPER 🔥
================================ */

export const validateCategory = (data: unknown) => {
  const result = categorySchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.format(),
    };
  }

  return {
    success: true,
    data: result.data,
  };
};