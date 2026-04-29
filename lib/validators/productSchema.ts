import { z } from "zod";

/* ================= HELPERS ================= */

const optionalString = () =>
z
.string()
.trim()
.transform((val) => (val === "" ? undefined : val))
.optional();

const requiredNumber = (msg = "Required", min = 0) =>
z.coerce.number().min(min, msg);

const optionalNumber = () =>
z.preprocess(
(val) => (val === "" ? undefined : val),
z.coerce.number().optional()
);

/* ================= CONSTANTS ================= */

export const LOCALES = ["EN", "HI", "MR"] as const;
export const CURRENCIES = ["INR", "USD"] as const;

/* ================= IMAGE ================= */

export const productImageSchema = z.object({
url: z.string().url("Valid image URL required"),
isPrimary: z.boolean().default(false),
});

/* ================= VARIANT ================= */

export const variantAttributeSchema = z.object({
name: z.string().min(1, "Attribute name required"),
value: z.string().min(1, "Attribute value required"),
});

export const wholesalePricingSchema = z.object({
minQty: z.coerce.number().min(1),
price: z.coerce.number().min(0),
});

export const productVariantSchema = z.object({
title: z.string().min(1),

sku: optionalString(),
barcode: optionalString(),

price: requiredNumber("Price required", 0),
salePrice: optionalNumber(),
costPrice: optionalNumber(),

currency: z.enum(CURRENCIES).default("INR"),

stock: optionalNumber(),
reservedStock: z.coerce.number().default(0),

trackInventory: z.boolean().default(true),

image: optionalString(),

isActive: z.boolean().default(true),
isDefault: z.boolean().default(false),

attributes: z.array(variantAttributeSchema).default([]),
wholesalePricing: z.array(wholesalePricingSchema).default([]),
});

/* ================= TRANSLATION ================= */

export const productTranslationSchema = z.object({
locale: z.enum(LOCALES),
title: z.string().min(1),
description: optionalString(),
metaTitle: optionalString(),
metaDescription: optionalString(),
});

/* ================= MAIN PRODUCT ================= */

export const productSchema = z
.object({
title: z.string().min(1),


slug: optionalString(), // slug backend generate करेगा

sku: optionalString(),
barcode: optionalString(),
productCode: optionalString(),

price: requiredNumber("Price required", 0),
salePrice: optionalNumber(),
costPrice: optionalNumber(),

stock: optionalNumber(),

currency: z.enum(CURRENCIES).default("INR"),

image: optionalString(),
images: z.array(productImageSchema).max(10).default([]),

isActive: z.boolean().default(true),
isWholesale: z.boolean().default(false),

categoryId: z.string().min(1),
subCategoryId: optionalString(),
userId: z.string().min(1),
hsnCodeId: optionalString(),

variants: z.array(productVariantSchema).min(1),
translations: z.array(productTranslationSchema).min(1),


})

/* ================= VALIDATIONS ================= */

.superRefine((data, ctx) => {
const defaults = data.variants.filter((v) => v.isDefault);


if (defaults.length !== 1) {
  ctx.addIssue({
    code: "custom",
    path: ["variants"],
    message: "Exactly one default variant required",
  });
}

data.variants.forEach((variant, index) => {
  if (
    typeof variant.salePrice === "number" &&
    variant.salePrice > variant.price
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["variants", index, "salePrice"],
      message: "Sale price must be <= price",
    });
  }

  const set = new Set<number>();

  variant.wholesalePricing.forEach((p, i) => {
    if (set.has(p.minQty)) {
      ctx.addIssue({
        code: "custom",
        path: ["variants", index, "wholesalePricing", i, "minQty"],
        message: "Duplicate minQty",
      });
    }
    set.add(p.minQty);
  });
});

const localeSet = new Set<string>();

data.translations.forEach((t, i) => {
  if (localeSet.has(t.locale)) {
    ctx.addIssue({
      code: "custom",
      path: ["translations", i, "locale"],
      message: "Duplicate locale",
    });
  }
  localeSet.add(t.locale);
});

const primaryImages = data.images.filter((img) => img.isPrimary);

if (data.images.length > 0 && primaryImages.length === 0) {
  ctx.addIssue({
    code: "custom",
    path: ["images"],
    message: "One primary image required",
  });
}

if (primaryImages.length > 1) {
  ctx.addIssue({
    code: "custom",
    path: ["images"],
    message: "Only one primary image allowed",
  });
}


});

/* ================= UPDATE ================= */

export const updateProductSchema = productSchema.extend({
id: z.string().min(1),
});

/* ================= TYPES ================= */

export type ProductInput = z.infer<typeof productSchema>;
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
