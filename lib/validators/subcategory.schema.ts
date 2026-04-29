import { z } from "zod";
import { LanguageEnum, OptionalString, IdSchema } from "./common";

export const subCategoryTranslationSchema = z.object({
<<<<<<< HEAD
  locale: LanguageEnum,
  title: z.string().min(1),
  description: OptionalString,
=======
  locale: localeEnum,
  slug: optionalString(),

  title: requiredString("Title", 2),

  description: optionalString(),
>>>>>>> 5cea87c5237b5e7bbd98e5f2766d0573faa130c1
});

export const subCategorySchema = z.object({
  slug: OptionalString,
  imageUrl: OptionalString,
  isActive: z.boolean().optional().default(true),

  categoryId: IdSchema,
  hsnCodeId: IdSchema.nullish(),

  translations: z.array(subCategoryTranslationSchema).min(1),
});
<<<<<<< HEAD
=======

export type SubCategoryInput = z.infer<typeof subCategorySchema>;

export type SubCategoryTranslationInput = z.infer<
  typeof subCategoryTranslationSchema
>;
>>>>>>> 5cea87c5237b5e7bbd98e5f2766d0573faa130c1
