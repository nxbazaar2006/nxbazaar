import { z } from "zod";
import { LanguageEnum, OptionalString, IdSchema } from "./common";

export const subCategoryTranslationSchema = z.object({
  locale: LanguageEnum,
  title: z.string().min(1),
  description: OptionalString,
});

export const subCategorySchema = z.object({
  slug: OptionalString,
  imageUrl: OptionalString,
  isActive: z.boolean().optional().default(true),

  categoryId: IdSchema,
  hsnCodeId: IdSchema.nullish(),

  translations: z.array(subCategoryTranslationSchema).min(1),
});
