import { z } from "zod";

/* ================================
   CONSTANTS
================================ */

export const LOCALES = ["en", "hi", "mr"] as const;

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

export const marketTranslationSchema = z.object({
  locale: z.enum(LOCALES),
  title: requiredString("Title", 2),
  description: optionalString(),
  slug: optionalString(),
});

/* ================================
   BASE SCHEMA (PURE)
================================ */

const baseMarketSchema = z.object({
  id: z.string().optional(),

  title: requiredString("Title", 2),

  slug: optionalString(),

  description: optionalString(),

  logoUrl: optionalString(),

  isActive: z.boolean().default(true),

  categoryIds: z
    .array(z.string().min(1))
    .min(1, "At least one category required"),

  translations: z
    .array(marketTranslationSchema)
    .min(1, "At least one translation required")
    .superRefine((translations, ctx) => {
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
   TRANSFORM FUNCTION 🔥
================================ */

const applyMarketTransform = (data: any) => ({
  ...data,
  slug: data.slug || generateSlug(data.title),
});

/* ================================
   CREATE SCHEMA (API)
================================ */

export const marketSchema = baseMarketSchema.transform(applyMarketTransform);

/* ================================
   UPDATE SCHEMA (FIXED ✅)
================================ */

export const updateMarketSchema = baseMarketSchema
  .extend({
    id: z.string().min(1, "Market ID required"),
  })
  .transform(applyMarketTransform);

/* ================================
   FORM SCHEMA (Frontend)
================================ */

export const marketFormSchema = baseMarketSchema.omit({
  slug: true,
});

/* ================================
   TYPES
================================ */

export type MarketInput = z.infer<typeof marketSchema>;
export type UpdateMarketInput = z.infer<typeof updateMarketSchema>;
export type MarketFormData = z.infer<typeof marketFormSchema>;

/* ================================
   VALIDATION HELPERS 🔥
================================ */

export const validateMarket = (data: unknown) => {
  const result = marketSchema.safeParse(data);

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

export const validateUpdateMarket = (data: unknown) => {
  const result = updateMarketSchema.safeParse(data);

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