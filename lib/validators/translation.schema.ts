import { z } from "zod";

export const TranslationSchema = z.object({
  language: z.enum(["EN", "HI", "MR", "TA", "TE", "KN", "GU"]),
  title: z.string().min(2),
});