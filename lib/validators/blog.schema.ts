import { z } from "zod";

/* ================= HELPERS ================= */

// empty string → undefined
export const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

// slug normalize
export const normalizeSlug = (value: unknown) => {
  if (typeof value !== "string") return value;
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

/* ================= BASIC SCHEMAS ================= */

// MongoDB ObjectId / UUID safe string
export const IdSchema = z
  .string()
  .min(1, "Invalid ID");

// optional string (auto trim + empty → undefined)
export const OptionalString = z.preprocess(
  emptyToUndefined,
  z.string().optional()
);

// required string (trim + min validation)
export const RequiredString = z
  .string()
  .trim()
  .min(1, "This field is required");

// slug schema (normalized)
export const SlugSchema = z.preprocess(
  normalizeSlug,
  z.string().min(3).max(200)
);

// optional URL
export const OptionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional()
);

/* ================= DATE ================= */

export const OptionalDate = z.preprocess(
  (value) => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const date = new Date(value as string);
    return isNaN(date.getTime()) ? undefined : date;
  },
  z.date().optional()
);

/* ================= NUMBER ================= */

// price (₹, $, etc.)
export const PriceSchema = z
  .number()
  .min(0, "Price must be positive");

// optional number
export const OptionalNumber = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.number().optional()
);

/* ================= BOOLEAN ================= */

export const OptionalBoolean = z
  .boolean()
  .optional();

/* ================= ARRAY ================= */

export const IdArraySchema = z
  .array(IdSchema)
  .optional();

/* ================= PAGINATION ================= */

export const PaginationSchema = z.object({
  page: z.preprocess(
    (val) => Number(val),
    z.number().min(1).default(1)
  ),
  limit: z.preprocess(
    (val) => Number(val),
    z.number().min(1).max(100).default(10)
  ),
});

/* ================= SORT ================= */

export const SortOrderEnum = z.enum(["asc", "desc"]);

/* ================= LANGUAGE ================= */

export const LanguageEnum = z.enum(["en", "hi", "mr"]);

/* ================= STATUS ================= */

export const StatusEnum = z.enum([
  "draft",
  "published",
  "archived",
]);