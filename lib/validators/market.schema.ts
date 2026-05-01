import { z } from "zod";
import { OptionalString, IdSchema, LanguageEnum } from "./common";

/* ---------------------------------- */
/* ✅ TRANSLATION */
/* ---------------------------------- */
export const marketTranslationSchema = z.object({
  locale: LanguageEnum,
  title: z.string().min(1),
  description: OptionalString,
  slug: OptionalString,
});

/* ---------------------------------- */
/* ✅ MAIN */
/* ---------------------------------- */
export const marketSchema = z.object({
  logoUrl: OptionalString,
  isActive: z.boolean().optional().default(true),

  translations: z.array(marketTranslationSchema).min(1),

  categoryIds: z
    .array(IdSchema)
    .optional()
    .refine((ids) => !ids || new Set(ids).size === ids.length, {
      message: "Duplicate categoryIds not allowed",
    }),
});

/* ---------------------------------- */
/* ✅ TYPES */
/* ---------------------------------- */
export type MarketInput = z.infer<typeof marketSchema>;
export type MarketTranslationInput = z.infer<
  typeof marketTranslationSchema
>;