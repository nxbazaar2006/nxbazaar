import { z } from "zod";

/* ---------------------------------- */
/* ✅ ENTITY */
/* ---------------------------------- */
export const SUPPORTED_SLUG_ENTITIES = [
  "category",
  "subcategory",
  "product",
  "blog",
  "vlog",
  "market",
] as const;

/* ---------------------------------- */
/* ✅ SCHEMA */
/* ---------------------------------- */
export const TranslationSchema = z.object({
  entity: z.enum(SUPPORTED_SLUG_ENTITIES),

  parentId: z.string().min(1, "Parent ID is required"),

  locale: z.enum(["EN", "HI", "MR", "TA", "TE", "KN", "GU"]),

  title: z.string().min(2, "Title too short"),

  description: z.string().optional(),

  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Invalid slug format")
    .optional(),
});