import { z } from "zod";
import { OptionalString, IdSchema } from "./common";

export const marketTranslationSchema = z.object({
  locale: z.string().min(2),
  title: z.string().min(1),
  description: OptionalString,
});

export const marketSchema = z.object({
  title: z.string().min(1),
  description: OptionalString,
  logoUrl: OptionalString,

  isActive: z.boolean().optional().default(true),

  translations: z.array(marketTranslationSchema),

  categoryIds: z.array(IdSchema).optional(), // multi-select
});