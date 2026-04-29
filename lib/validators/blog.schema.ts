import { z } from "zod";
import { LanguageEnum, OptionalString, IdSchema, OptionalDate } from "./common";

export const blogTranslationSchema = z.object({
  locale: LanguageEnum,
  title: z.string().min(1),
  description: OptionalString,
  metaTitle: OptionalString,
  metaDescription: OptionalString,
});

export const blogSchema = z.object({
  imageUrl: OptionalString,

  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),

  content: z.any(), // 👉 JSON content (safe enough here)

  userId: IdSchema,
  categoryId: IdSchema.optional(),

  publishedAt: OptionalDate,

  translations: z.array(blogTranslationSchema).min(1),

  relatedProductIds: z.array(IdSchema).optional(),
});