import { z } from "zod";

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
  minQty: z.coerce.number().min(1, "Minimum qty must be at least 1"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
});

export const productVariantSchema = z.object({
  title: z.string().min(1, "Variant title required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  salePrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  currency: z.enum(CURRENCIES).default("INR"),
  stock: z.coerce.number().optional(),
  reservedStock: z.coerce.number().default(0),
  lowStockAlert: z.coerce.number().optional(),
  trackInventory: z.boolean().default(true),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  attributes: z.array(variantAttributeSchema).default([]),
  wholesalePricing: z.array(wholesalePricingSchema).default([]),
});

export const productTranslationSchema = z.object({
  locale: z.enum(LOCALES),
  title: z.string().min(1, "Translation title required"),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const productSchema = z
  .object({
    title: z.string().min(2, "Title required"),
    slug: z.string().optional(),
    tags: z.array(z.string()).default([]),
    unit: z.string().optional(),
    isActive: z.boolean().default(true),
    isWholesale: z.boolean().default(false),
    currency: z.enum(CURRENCIES).default("INR"),
    categoryId: z.string().min(1, "Category required"),
    subCategoryId: z.string().optional(),
    userId: z.string().min(1, "User required"),
    hsnCodeId: z.string().optional(),
    images: z.array(productImageSchema).default([]),
    variants: z.array(productVariantSchema).default([]),
    translations: z.array(productTranslationSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.variants.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one variant required",
        path: ["variants"],
      });
    }

    const defaults = data.variants.filter((variant) => variant.isDefault);
    if (defaults.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "One default variant required",
        path: ["variants"],
      });
    }
    if (defaults.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only one default variant allowed",
        path: ["variants"],
      });
    }

    data.variants.forEach((variant, index) => {
      if (
        typeof variant.salePrice === "number" &&
        variant.salePrice > variant.price
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sale price must be less than or equal to price",
          path: ["variants", index, "salePrice"],
        });
      }

      const minQtySet = new Set<number>();
      variant.wholesalePricing.forEach((pricing, pricingIndex) => {
        if (minQtySet.has(pricing.minQty)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Duplicate minimum quantity",
            path: [
              "variants",
              index,
              "wholesalePricing",
              pricingIndex,
              "minQty",
            ],
          });
        }
        minQtySet.add(pricing.minQty);
      });
    });

    if (data.translations.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one translation required",
        path: ["translations"],
      });
    }

    const localeSet = new Set<string>();
    data.translations.forEach((translation, index) => {
      if (localeSet.has(translation.locale)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate locale",
          path: ["translations", index, "locale"],
        });
      }
      localeSet.add(translation.locale);
    });

    const primaryImages = data.images.filter((image) => image.isPrimary);
    if (data.images.length > 0 && primaryImages.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "One primary image required",
        path: ["images"],
      });
    }
    if (primaryImages.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only one primary image allowed",
        path: ["images"],
      });
    }
  });

export type ProductInput = z.infer<typeof productSchema>;
