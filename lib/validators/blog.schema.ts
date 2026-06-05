import { z } from "zod";

/* ================= HELPERS ================= */

export const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const normalizeSlug = (value: unknown) => {
  if (typeof value !== "string") return value;

  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/* ================= BASIC ================= */

export const IdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const OptionalString = z.preprocess(
  emptyToUndefined,
  z.string().optional()
);

export const RequiredString = z
  .string()
  .trim()
  .min(1, "This field is required");

export const SlugSchema = z.preprocess(
  normalizeSlug,
  z.string().min(3).max(200)
);

export const OptionalSlug = z.preprocess(
  (val: unknown) => emptyToUndefined(normalizeSlug(val)),
  z.string().min(3).max(200).optional()
);

export const OptionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional()
);

/* ================= DATE ================= */

export const OptionalDate = z.preprocess(
  (value: unknown) => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const date = new Date(value as string);
    return isNaN(date.getTime()) ? undefined : date;
  },
  z.date().optional()
);

/* ================= NUMBER ================= */

export const PriceSchema = z.preprocess(
  (val: unknown) => Number(val),
  z.number().min(0)
);

export const OptionalNumber = z.preprocess(
  (val: unknown) => {
    if (val === "" || val == null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  },
  z.number().optional()
);

/* ================= BOOLEAN ================= */

export const OptionalBoolean = z.preprocess(
  (val: unknown) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  },
  z.boolean().optional()
);

/* ================= ARRAY ================= */

export const IdArraySchema = z.array(IdSchema).optional();

/* ================= PAGINATION ================= */

export const PaginationSchema = z.object({
  page: z.preprocess((val: unknown) => Number(val), z.number().min(1).default(1)),
  limit: z.preprocess(
    (val: unknown) => Number(val),
    z.number().min(1).max(100).default(10)
  ),
});

/* ================= SORT ================= */

export const SortOrderEnum = z.enum(["asc", "desc"]);

/* ================= LANGUAGE ================= */

export const LanguageEnum = z.preprocess(
  (v: unknown) => (typeof v === "string" ? v.toUpperCase() : v),
  z.enum(["EN", "HI", "MR"])
);

/* ================= STATUS ================= */

export const StatusEnum = z.enum([
  "draft",
  "published",
  "archived",
]);

export const blogTranslationSchema = z.object({
  locale: z.string().min(2),
  slug: OptionalString,
  title: z.string().trim().min(1, "Title is required"),
  description: OptionalString,
  metaTitle: OptionalString,
  metaDescription: OptionalString,
});

export const blogSchema = z.object({
  slug: OptionalString,
  imageUrl: OptionalString,
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  content: z.any().default({}),
  userId: OptionalString,
  categoryId: OptionalString,
  publishedAt: z.coerce.date().optional(),
  translations: z.array(blogTranslationSchema).min(1),
  relatedProductIds: z.array(z.string()).optional(),
});

export type BlogInput = z.infer<typeof blogSchema>;
