import { z } from "zod";

/* ================= CONSTANTS ================= */

export const LOCALES = ["en", "hi", "mr"] as const;
export type SupportedLocale = (typeof LOCALES)[number];

/* ================= HELPERS ================= */

const optionalString = () =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .optional();

const numberParser = (value: unknown) => {
  if (value === "" || value === null || value === undefined)
    return undefined;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
};

const optionalNumber = () =>
  z.preprocess(numberParser, z.number().optional());

const requiredNumber = (msg: string, min?: number) =>
  z.preprocess(
    numberParser,
    z.number({ required_error: msg }).min(min ?? 0, msg)
  );

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/* ================= IMAGE ================= */

export const productImageSchema = z.object({
  url: z.string().url(),
  isPrimary: z.boolean().default(false),
});

/* ================= VARIANT ================= */

export const variantSchema = z
  .object({
    title: z.string().min(1),

    sku: optionalString(),
    barcode: optionalString(),
    productCode: optionalString(),

    price: requiredNumber("Price required", 0),
    salePrice: optionalNumber(),
    costPrice: optionalNumber(),

    stock: optionalNumber(),
    image: optionalString(),

    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),

    attributes: z
      .array(
        z.object({
          name: z.string().min(1),
          value: z.string().min(1),
        })
      )
      .default([]),

    wholesalePricing: z
      .array(
        z.object({
          minQty: requiredNumber("Min qty", 1),
          price: requiredNumber("Wholesale price", 0),
        })
      )
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (data.salePrice && data.salePrice > data.price) {
      ctx.addIssue({
        code: "custom",
        path: ["salePrice"],
        message: "Sale price must be <= price",
      });
    }

    if (data.costPrice && data.costPrice > data.price) {
      ctx.addIssue({
        code: "custom",
        path: ["costPrice"],
        message: "Cost price must be <= price",
      });
    }
  });

/* ================= TRANSLATION ================= */

export const translationSchema = z.object({
  locale: z.enum(LOCALES),
  slug: optionalString(),
  title: z.string().min(2),
  description: optionalString(),
});

/* ================= BASE PRODUCT ================= */

const baseProductSchema = z.object({
  id: z.string().optional(),

  title: z.string().min(2),
  slug: optionalString(),

  description: optionalString(),

  imageUrl: optionalString(),

  productImages: z.array(z.string().url()).min(1),

  tags: z.array(z.string()).max(10).default([]),

  unit: optionalString(),

  isActive: z.boolean().default(true),
  isWholesale: z.boolean().default(false),

  currency: z.enum(["INR", "USD"]).default("INR"),

  categoryId: z.string().min(1),
  subCategoryId: optionalString(),

  userId: z.string().min(1),

  hsnCodeId: optionalString(),

  gstRate: optionalNumber(),
  cgst: optionalNumber(),
  sgst: optionalNumber(),
  igst: optionalNumber(),
});

/* ================= GST VALIDATION ================= */

const withGSTValidation = baseProductSchema.superRefine(
  (data, ctx) => {
    const hasSplit = data.cgst || data.sgst || data.igst;

    if (data.gstRate && hasSplit) {
      ctx.addIssue({
        code: "custom",
        path: ["gstRate"],
        message: "Use either gstRate OR cgst/sgst/igst",
      });
    }

    if (data.igst && (data.cgst || data.sgst)) {
      ctx.addIssue({
        code: "custom",
        path: ["igst"],
        message: "IGST cannot mix with CGST/SGST",
      });
    }

    if (data.cgst && !data.sgst) {
      ctx.addIssue({
        code: "custom",
        path: ["sgst"],
        message: "SGST required",
      });
    }

    if (data.sgst && !data.cgst) {
      ctx.addIssue({
        code: "custom",
        path: ["cgst"],
        message: "CGST required",
      });
    }
  }
);

/* ================= BASE EXTENDED ================= */

const productBaseSchema = withGSTValidation.extend({
  variants: z.array(variantSchema).min(1),
  translations: z.array(translationSchema).min(1),
});

/* ================= MAIN PRODUCT ================= */

export const productSchema = productBaseSchema
  .superRefine((data, ctx) => {
    const defaults = data.variants.filter((v) => v.isDefault);

    if (defaults.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Exactly one default variant required",
      });
    }
  })
  .transform((data) => ({
    ...data,
    slug: data.slug || generateSlug(data.title),
  }));

/* ================= CREATE / UPDATE ================= */

export const createProductSchema = productSchema;

// ✅ FINAL FIX (IMPORTANT)
export const updateProductSchema = productBaseSchema.safeExtend({
  id: z.string().min(1),
});

/* ================= TYPES ================= */

export type ProductInput = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/* ================= VALIDATOR ================= */

export const validateProduct = (data: unknown) => {
  const result = productSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  return {
    success: true,
    data: result.data,
  };
};
