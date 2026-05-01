import { z } from "zod";
import { Language } from "@prisma/client";

/* ================= HELPERS ================= */

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

/* ================= LOCALE ================= */

const localeSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    return value.toUpperCase();
  },
  z.nativeEnum(Language)
);

/* ================= TRANSLATION ================= */

export const CategoryTranslationSchema = z.object({
  locale: localeSchema,

  slug: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/, "Invalid slug format")
      .optional() // ✅ important
  ),

  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters"),

  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().optional()
  ),
});

/* ================= BASE ================= */

export const CategorySchema = z.object({
  slug: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/, "Invalid slug format")
      .optional() // ✅ changed (auto generate support)
  ),

  imageUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("Image URL must be a valid URL").optional()
  ),

  isActive: z.boolean().default(true),

  translations: z
    .array(CategoryTranslationSchema)
    .min(1, "At least one translation is required")
    .superRefine((translations, ctx) => {
      const locales = translations.map((t) => t.locale);
      const unique = new Set(locales);

      if (locales.length !== unique.size) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate locales are not allowed",
        });
      }
    }),
});

/* ================= TYPES ================= */

export type CategoryInput = z.infer<typeof CategorySchema>;