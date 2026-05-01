import { z } from "zod";
import {
  LanguageEnum,
  OptionalString,
  IdSchema,
  requiredString,
} from "./common";

/* ---------------------------------- */
/* ✅ TRANSLATION SCHEMA */
/* ---------------------------------- */
export const subCategoryTranslationSchema = z.object({
  locale: LanguageEnum,
  slug: OptionalString,

  title: requiredString("Title", 2),

  description: OptionalString,
});

/* ---------------------------------- */
/* ✅ MAIN SCHEMA */
/* ---------------------------------- */
export const subCategorySchema = z.object({
  slug: OptionalString,
  imageUrl: OptionalString,
  isActive: z.boolean().optional().default(true),

  categoryId: IdSchema,
  hsnCodeId: IdSchema.nullish(),

  translations: z.array(subCategoryTranslationSchema).min(1),
});

/* ---------------------------------- */
/* ✅ TYPES */
/* ---------------------------------- */
export type SubCategoryInput = z.infer<typeof subCategorySchema>;

export type SubCategoryTranslationInput = z.infer<
  typeof subCategoryTranslationSchema
>;