import { z } from "zod";

const optionalString = () =>
  z
    .union([z.string().trim().min(1), z.literal(""), z.undefined(), z.null()])
    .transform((value) => value || undefined);

const optionalNumber = () =>
  z
    .union([z.coerce.number(), z.literal(""), z.undefined(), z.null()])
    .transform((value) => (value === "" || value === null ? undefined : value));

const requiredNumber = (message = "Required", min = 0) =>
  z.coerce.number().min(min, message);

export const LOCALES = ["EN", "HI", "MR"] as const;
export const CURRENCIES = ["INR", "USD"] as const;

export const productImageSchema = z.object({
  url: z.string().url("Valid image URL required"),
  isPrimary: z.boolean().default(false),
});

export const variantAttributeSchema = z.object({
  name: z.string().min(1, "Attribute name required"),
  value: z.string().min(1, "Attribute value required"),
});

export const wholesalePricingSchema = z.object({
  minQty: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
});

export const productVariantSchema = z.object({
  title: z.string().min(1, "Variant title required"),
  sku: optionalString(),
  barcode: optionalString(),
  productCode: optionalString(),
  price: requiredNumber("Price required", 0),
  salePrice: optionalNumber(),
  costPrice: optionalNumber(),
  currency: z.enum(CURRENCIES).default("INR"),
  stock: optionalNumber(),
  reservedStock: z.coerce.number().default(0),
  lowStockAlert: optionalNumber(),
  trackInventory: z.boolean().default(true),
  image: optionalString(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  attributes: z.array(variantAttributeSchema).default([]),
  wholesalePricing: z.array(wholesalePricingSchema).default([]),
});

export const productTranslationSchema = z.object({
  locale: z.enum(LOCALES),
  slug: optionalString(),
  title: z.string().min(1, "Translation title required"),
  description: optionalString(),
  metaTitle: optionalString(),
  metaDescription: optionalString(),
});

export const productSchema = z
  .object({
    title: z.string().trim().min(1, "Product title required"),
    slug: optionalString(),
    imageUrl: optionalString(),
    tags: z.array(z.string().trim().min(1)).default([]),
    unit: optionalString(),
    isActive: z.boolean().default(true),
    isWholesale: z.boolean().default(false),
    currency: z.enum(CURRENCIES).default("INR"),
    gstRate: optionalNumber(),
    categoryId: z.string().min(1, "Category required"),
    subCategoryId: optionalString(),
    userId: z.string().min(1, "User required"),
    hsnCodeId: optionalString(),
    images: z.array(productImageSchema).max(10).default([]),
    variants: z.array(productVariantSchema).min(1, "At least one variant required"),
    translations: z
      .array(productTranslationSchema)
      .min(1, "At least one translation required"),
  })
  .superRefine((data, ctx) => {
    const defaults = data.variants.filter((variant) => variant.isDefault);

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

      const minQtySet = new Set<number>();
      variant.wholesalePricing.forEach((price, priceIndex) => {
        if (minQtySet.has(price.minQty)) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "wholesalePricing", priceIndex, "minQty"],
            message: "Duplicate minQty",
          });
        }
        minQtySet.add(price.minQty);
      });
    });

    const localeSet = new Set<string>();
    data.translations.forEach((translation, index) => {
      if (localeSet.has(translation.locale)) {
        ctx.addIssue({
          code: "custom",
          path: ["translations", index, "locale"],
          message: "Duplicate locale",
        });
      }
      localeSet.add(translation.locale);
    });

    const primaryImages = data.images.filter((image) => image.isPrimary);

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

export const updateProductSchema = productSchema.extend({
  id: z.string().min(1),
});

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

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
