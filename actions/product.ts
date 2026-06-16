"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  productSchema,
  LOCALES,
  type ProductInput,
} from "@/lib/validators/productSchema";
import { translateProductContent } from "@/lib/openai/productTranslation";
import { generateUniqueSlug } from "@/lib/slug/translationSlug";
import { generateSlug } from "@/lib/generateSlug";
import {
  barcodeValueFromSku,
  getBarcodeImageUrl,
} from "@/lib/barcode";
import {
  generateProductCode,
  productCodePrefix,
  generateSku,
} from "@/lib/productCodeGeneration";
import type { ProductWithRelations } from "@/types/product";
import type { ActionResponse } from "@/types/action-response";

type ProductQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type ProductListResult = {
  data: ProductWithRelations[];
  total: number;
};

type SkuContext = {
  vendorCode: string;
  productTitle: string;
  subCategory: string;
};

type SkuInput = {
  vendorCode: string;
  productTitle: string;
  subCategory: string;
  color: string;
  size: string;
  number: number | string;
};

type ProductLabelData = {
  productId: string;
  variantId: string;
  title: string;
  variant: string;
  sku: string | null;
  barcode: string | null;
  productCode: string | null;
  price: number;
  salePrice: number | null;
  stock: number | null;
};

export type ProductHistoryItem = {
  id: string;
  productId: string;
  productCode: string | null;
  productTitle: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  variantId: string | null;
  sku: string | null;
  changedByUserId: string | null;
  changedByUserCode: string | null;
  changedByRole: string | null;
  sellerCode: string | null;
  createdAt: Date;
};

type ProductHistoryActor = {
  changedByUserId: string | null;
  changedByUserCode: string | null;
  changedByRole: string | null;
  sellerCode: string | null;
};

type ProductHistoryAction = "CREATE" | "UPDATE" | "DELETE" | "VARIANT_UPDATE";

type ProductHistoryEntry = {
  productId: string;
  productCode: string | null;
  productTitle: string;
  action: ProductHistoryAction;
  field?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  variantId?: string | null;
  sku?: string | null;
  user?: ProductHistoryActor;
};

type ProductSnapshot = Awaited<ReturnType<typeof getProductSnapshot>>;

const productInclude = {
  category: {
    include: {
      translations: true,
    },
  },
  subCategory: {
    include: {
      translations: true,
    },
  },
  hsnCode: true,
  user: true,
  images: true,
  variants: {
    include: {
      attributes: true,
      wholesalePricing: true,
    },
  },
  translations: true,
} as const;

const HISTORY_PRODUCT_FIELDS = [
  "title",
  "slug",
  "productCode",
  "tags",
  "unit",
  "isActive",
  "isWholesale",
  "currency",
  "gstRate",
  "categoryId",
  "subCategoryId",
  "hsnCodeId",
] as const;

const HISTORY_VARIANT_FIELDS = [
  "title",
  "price",
  "salePrice",
  "costPrice",
  "currency",
  "stock",
  "reservedStock",
  "lowStockAlert",
  "trackInventory",
  "image",
  "isActive",
  "isDefault",
] as const;

type ProductLocale = (typeof LOCALES)[number];
type ProductTranslationInput = ProductInput["translations"][number];

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function pickEnglishTranslation(translations: ProductInput["translations"]) {
  return (
    translations.find(
      (translation: ProductTranslationInput) => translation.locale === "EN"
    ) ??
    translations[0]
  );
}

function normalizeProductTranslations(input: ProductInput): ProductInput["translations"] {
  const existing = input.translations ?? [];
  const english = pickEnglishTranslation(existing);
  const englishTitle = cleanText(english?.title) || cleanText(input.title);
  const englishDescription = cleanText(english?.description);
  const englishMetaTitle = cleanText(english?.metaTitle);
  const englishMetaDescription = cleanText(english?.metaDescription);

  return LOCALES.map((locale) => {
    const translation = existing.find(
      (item: ProductTranslationInput) => item.locale === locale
    );

    return {
      locale,
      slug: cleanText(translation?.slug) || undefined,
      title: cleanText(translation?.title) || englishTitle,
      description:
        cleanText(translation?.description) || englishDescription || undefined,
      metaTitle: cleanText(translation?.metaTitle) || englishMetaTitle || undefined,
      metaDescription:
        cleanText(translation?.metaDescription) ||
        englishMetaDescription ||
        undefined,
    };
  });
}

async function autoTranslateProductInput(input: ProductInput): Promise<ProductInput> {
  const translations = normalizeProductTranslations(input);
  const english = pickEnglishTranslation(translations);
  const productTitle = cleanText(english.title) || cleanText(input.title);
  const translatedContent = await translateProductContent({
    title: productTitle,
    description: cleanText(english.description) || undefined,
  });
  const translated = translations.map((translation: ProductTranslationInput) => {
    const locale = translation.locale as ProductLocale;

    return {
      ...translation,
      title: translatedContent[locale].title,
      description: translatedContent[locale].description,
    };
  });

  return {
    ...input,
    title: productTitle,
    translations: translated,
  };
}

async function withTranslationSlugs(translations: ProductInput["translations"]) {
  return Promise.all(
    translations.map(async (translation: ProductInput["translations"][number]) => ({
      ...translation,
      slug:
        translation.slug ||
        (await generateUniqueSlug(
          "product",
          translation.locale,
          translation.title
        )),
    }))
  );
}

function productError(error: unknown, fallback: string) {
  console.error(fallback, error);

  return {
    success: false,
    error: error instanceof Error ? error.message : "Something went wrong",
  } satisfies ActionResponse<never>;
}

function historyValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function normalizeHistoryValue(value: unknown) {
  return historyValue(value) ?? "";
}

function valuesChanged(oldValue: unknown, newValue: unknown) {
  return normalizeHistoryValue(oldValue) !== normalizeHistoryValue(newValue);
}

function sortedImages(images: { url: string; isPrimary: boolean }[]) {
  return images
    .map((image) => ({ url: image.url, isPrimary: image.isPrimary }))
    .sort((a, b) => `${a.url}:${a.isPrimary}`.localeCompare(`${b.url}:${b.isPrimary}`));
}

function sortedAttributes(
  attributes: { name: string; value: string }[]
) {
  return attributes
    .map((attribute) => ({ name: attribute.name, value: attribute.value }))
    .sort((a, b) => `${a.name}:${a.value}`.localeCompare(`${b.name}:${b.value}`));
}

function sortedWholesalePricing(
  pricing: { minQty: number; price: number }[]
) {
  return pricing
    .map((tier) => ({ minQty: tier.minQty, price: tier.price }))
    .sort((a, b) => a.minQty - b.minQty);
}

function productCodeForHistory(
  product:
    | (Pick<ProductWithRelations, "variants"> & { productCode?: string | null })
    | null
    | undefined
) {
  return (
    product?.productCode ??
    product?.variants.find((variant) => variant.isDefault)?.productCode ??
    product?.variants[0]?.productCode ??
    null
  );
}

function variantHistoryKey(variant: {
  sku: string | null;
  productCode: string | null;
  title: string;
}) {
  return variant.sku ?? variant.productCode ?? `title:${variant.title}`;
}

function historyActionForField(_field: string, variantLevel = false): ProductHistoryAction {
  return variantLevel ? "VARIANT_UPDATE" : "UPDATE";
}

async function getProductSnapshot(id: string) {
  return db.product.findUnique({
    where: { id },
    include: productInclude,
  });
}

async function getHistoryActor(
  fallbackUserId: string | null = null
): Promise<ProductHistoryActor> {
  const session = await auth();
  const actorId = session?.user?.id ?? fallbackUserId;

  if (!actorId) {
    return {
      changedByUserId: null,
      changedByUserCode: null,
      changedByRole: null,
      sellerCode: null,
    };
  }

  const user = await db.user.findUnique({
    where: { id: actorId },
    select: {
      id: true,
      role: true,
      profile: {
        select: {
          username: true,
        },
      },
      sellerProfile: {
        select: {
          code: true,
        },
      },
    },
  });

  return {
    changedByUserId: user?.id ?? actorId ?? null,
    changedByUserCode: user?.profile?.username ?? user?.id ?? actorId ?? null,
    changedByRole: user?.role ?? null,
    sellerCode: user?.sellerProfile?.code ?? null,
  };
}

function createProductHistory({
  productId,
  productCode,
  productTitle,
  action,
  field,
  oldValue,
  newValue,
  variantId,
  sku,
  user,
}: ProductHistoryEntry & { user: ProductHistoryActor }) {
  return db.productHistory.create({
    data: {
      productId,
      productCode,
      productTitle,
      action,
      field: field ?? null,
      oldValue: historyValue(oldValue),
      newValue: historyValue(newValue),
      variantId: variantId ?? null,
      sku: sku ?? null,
      changedByUserId: user.changedByUserId,
      changedByUserCode: user.changedByUserCode,
      changedByRole: user.changedByRole,
      sellerCode: user.sellerCode,
    },
  });
}

async function writeProductHistory(
  entries: ProductHistoryEntry[],
  actor: ProductHistoryActor
) {
  if (entries.length === 0) return;

  try {
    await db.$transaction(
      entries.map((entry) =>
        createProductHistory({
          ...entry,
          user: entry.user ?? actor,
        })
      )
    );
  } catch (error) {
    console.error("PRODUCT_HISTORY_WRITE_ERROR", error);
  }
}

async function recordProductCreated(
  product: ProductWithRelations,
  actor: ProductHistoryActor
) {
  await writeProductHistory(
    [
      {
        productId: product.id,
        productCode: productCodeForHistory(product),
        productTitle: product.title,
        action: "CREATE",
        field: "product",
        oldValue: null,
        newValue: {
          title: product.title,
          slug: product.slug,
          productCode: productCodeForHistory(product),
          variants: product.variants.length,
          generatedVariants: product.variants.map((variant) => ({
            id: variant.id,
            title: variant.title,
            sku: variant.sku,
            productCode: variant.productCode,
            barcode: variant.barcode,
          })),
          images: product.images.length,
        },
      },
    ],
    actor
  );
}

function productTranslationForLocale(
  product: ProductWithRelations,
  locale: (typeof LOCALES)[number]
) {
  return (
    product.translations.find((translation) => translation.locale === locale) ??
    product.translations.find((translation) => translation.locale === "EN") ??
    product.translations[0]
  );
}

function entityLabel(entity: {
  id: string;
  translations?: { title: string; slug: string | null; locale: string }[];
}) {
  const translation =
    entity.translations?.find((item) => item.locale === "EN") ??
    entity.translations?.[0];

  return translation?.title ?? translation?.slug ?? entity.id;
}

function productContentContext(product: ProductWithRelations) {
  const categoryTitle = entityLabel(product.category);
  const subCategoryTitle = product.subCategory
    ? entityLabel(product.subCategory)
    : null;

  return {
    categoryTitle,
    subCategoryTitle,
    sectionTitle: subCategoryTitle
      ? `${categoryTitle} / ${subCategoryTitle}`
      : categoryTitle,
  };
}

async function ensureProductBlogCategory(product: ProductWithRelations) {
  const { categoryTitle } = productContentContext(product);
  const slug = generateSlug(categoryTitle);

  return db.blogCategory.upsert({
    where: { slug },
    update: {
      title: categoryTitle,
    },
    create: {
      slug,
      title: categoryTitle,
    },
  });
}

async function generateUniqueBlogSlug(baseValue: string) {
  const base = generateSlug(baseValue);
  let slug = base;
  let counter = 1;

  while (counter < 1000) {
    const existing = await db.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${base}-${counter++}`;
  }

  throw new Error("Blog slug generation failed");
}

async function createProductBlogAndVlog(product: ProductWithRelations) {
  const { categoryTitle, subCategoryTitle, sectionTitle } =
    productContentContext(product);
  const existingBlog = await db.blog.findFirst({
    where: {
      relatedProducts: {
        some: { id: product.id },
      },
    },
    select: { id: true },
  });
  const existingVlog = await db.vlog.findFirst({
    where: { productId: product.id },
    select: { id: true },
  });

  if (existingBlog && existingVlog) {
    return;
  }

  const blogCategory = await ensureProductBlogCategory(product);
  const blog =
    existingBlog ??
    (await db.blog.create({
      data: {
        slug: await generateUniqueBlogSlug(`${product.slug}-blog`),
        imageUrl: product.imageUrl,
        isActive: true,
        isFeatured: false,
        content: {
          type: "auto-product-blog",
          productId: product.id,
          productTitle: product.title,
          categoryId: product.categoryId,
          categoryTitle,
          subCategoryId: product.subCategoryId,
          subCategoryTitle,
        },
        userId: product.userId,
        categoryId: blogCategory.id,
        translations: {
          create: await Promise.all(
            LOCALES.map(async (locale) => {
              const translation = productTranslationForLocale(product, locale);
              const title = `${translation?.title ?? product.title} - ${sectionTitle}`;

              return {
                locale,
                title,
                description:
                  translation?.description ??
                  `Explore ${product.title} in ${sectionTitle}.`,
                metaTitle: title,
                metaDescription:
                  translation?.metaDescription ??
                  translation?.description ??
                  `Explore ${product.title} in ${sectionTitle}.`,
                slug: await generateUniqueSlug("blog", locale, title),
              };
            })
          ),
        },
        relatedProducts: {
          connect: { id: product.id },
        },
      },
    }));

  if (existingVlog) {
    return;
  }

  const vlogTranslations = await Promise.all(
    LOCALES.map(async (locale) => {
      const translation = productTranslationForLocale(product, locale);
      const title = `${translation?.title ?? product.title} Vlog - ${sectionTitle}`;

      return {
        locale,
        title,
        slug: await generateUniqueSlug("vlog", locale, title),
      };
    })
  );

  await db.vlog.create({
    data: {
      title: `${product.title} Vlog`,
      productId: product.id,
      userId: product.userId,
      blogId: blog.id,
      translations: {
        create: vlogTranslations,
      },
    },
  });
}

export async function syncMissingProductBlogAndVlog(productId?: string) {
  try {
    const products = await db.product.findMany({
      where: productId ? { id: productId } : undefined,
      include: productInclude,
    });

    for (const product of products) {
      await createProductBlogAndVlog(product as ProductWithRelations);
    }

    return { success: true, data: products.length };
  } catch (error) {
    console.error("PRODUCT_BLOG_VLOG_SYNC_ERROR:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to sync product blog and vlog",
    };
  }
}

async function recordProductChanges(
  oldProduct: ProductSnapshot,
  newProduct: ProductWithRelations,
  actor: ProductHistoryActor
) {
  if (!oldProduct) return;

  const productCode = productCodeForHistory(newProduct) ?? productCodeForHistory(oldProduct);
  const entries: ProductHistoryEntry[] = [];

  HISTORY_PRODUCT_FIELDS.forEach((field) => {
    const oldValue = oldProduct[field];
    const newValue = newProduct[field];

    if (valuesChanged(oldValue, newValue)) {
      entries.push({
        productId: newProduct.id,
        productCode,
        productTitle: newProduct.title,
        action: historyActionForField(field),
        field,
        oldValue,
        newValue,
      });
    }
  });

  const oldImages = sortedImages(oldProduct.images);
  const newImages = sortedImages(newProduct.images);

  if (valuesChanged(oldImages, newImages)) {
    entries.push({
      productId: newProduct.id,
      productCode,
      productTitle: newProduct.title,
      action: "UPDATE",
      field: "images",
      oldValue: oldImages,
      newValue: newImages,
    });
  }

  const oldVariants = new Map(
    oldProduct.variants.map((variant) => [variantHistoryKey(variant), variant])
  );

  newProduct.variants.forEach((variant) => {
    const oldVariant = oldVariants.get(variantHistoryKey(variant));

    if (!oldVariant) {
      entries.push({
        productId: newProduct.id,
        productCode,
        productTitle: newProduct.title,
        action: "VARIANT_UPDATE",
        field: "variant",
        oldValue: null,
        newValue: {
          title: variant.title,
          sku: variant.sku,
          productCode: variant.productCode,
        },
        variantId: variant.id,
        sku: variant.sku,
      });
      return;
    }

    HISTORY_VARIANT_FIELDS.forEach((field) => {
      const oldValue = oldVariant[field];
      const newValue = variant[field];

      if (valuesChanged(oldValue, newValue)) {
        entries.push({
          productId: newProduct.id,
          productCode,
          productTitle: newProduct.title,
          action: historyActionForField(field, true),
          field,
          oldValue,
          newValue,
          variantId: variant.id,
          sku: variant.sku,
        });
      }
    });

    const oldAttributes = sortedAttributes(oldVariant.attributes);
    const newAttributes = sortedAttributes(variant.attributes);

    if (valuesChanged(oldAttributes, newAttributes)) {
      entries.push({
        productId: newProduct.id,
        productCode,
        productTitle: newProduct.title,
        action: "VARIANT_UPDATE",
        field: "attributes",
        oldValue: oldAttributes,
        newValue: newAttributes,
        variantId: variant.id,
        sku: variant.sku,
      });
    }

    const oldPricing = sortedWholesalePricing(oldVariant.wholesalePricing);
    const newPricing = sortedWholesalePricing(variant.wholesalePricing);

    if (valuesChanged(oldPricing, newPricing)) {
      entries.push({
        productId: newProduct.id,
        productCode,
        productTitle: newProduct.title,
        action: "VARIANT_UPDATE",
        field: "wholesalePricing",
        oldValue: oldPricing,
        newValue: newPricing,
        variantId: variant.id,
        sku: variant.sku,
      });
    }
  });

  await writeProductHistory(entries, actor);
}

function productDeleteSnapshot(product: ProductWithRelations) {
  return {
    id: product.id,
    title: product.title,
    productCode: productCodeForHistory(product),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      productCode: variant.productCode,
      barcode: variant.barcode,
    })),
  };
}

async function getProductsReferencedByOrdersOrSales(ids: string[]) {
  if (ids.length === 0) {
    return new Set<string>();
  }

  const [orderItems, sales] = await Promise.all([
    db.orderItem.findMany({
      where: { productId: { in: ids } },
      select: { productId: true },
      distinct: ["productId"],
    }),
    db.sale.findMany({
      where: { productId: { in: ids } },
      select: { productId: true },
      distinct: ["productId"],
    }),
  ]);

  return new Set([
    ...orderItems.map((item) => item.productId),
    ...sales.map((sale) => sale.productId),
  ]);
}

async function getVariantsReferencedByOrdersOrSales(ids: string[]) {
  if (ids.length === 0) {
    return new Set<string>();
  }

  const [orderItems, sales] = await Promise.all([
    db.orderItem.findMany({
      where: { productVariantId: { in: ids } },
      select: { productVariantId: true },
      distinct: ["productVariantId"],
    }),
    db.sale.findMany({
      where: { productVariantId: { in: ids } },
      select: { productVariantId: true },
      distinct: ["productVariantId"],
    }),
  ]);

  return new Set([
    ...orderItems.map((item) => item.productVariantId),
    ...sales.flatMap((sale) =>
      sale.productVariantId ? [sale.productVariantId] : []
    ),
  ]);
}

async function recordProductDeleted(
  product: ProductWithRelations,
  actor: ProductHistoryActor
) {
  await writeProductHistory(
    [
      {
        productId: product.id,
        productCode: productCodeForHistory(product),
        productTitle: product.title,
        action: "DELETE",
        field: "product",
        oldValue: productDeleteSnapshot(product),
        newValue: null,
        variantId: product.variants.find((variant) => variant.isDefault)?.id ?? null,
        sku: product.variants.find((variant) => variant.isDefault)?.sku ?? null,
      },
    ],
    actor
  );
}

function variantAttribute(
  variant: ProductInput["variants"][number],
  names: string[]
) {
  const normalizedNames = names.map((name) => name.toLowerCase());

  return variant.attributes.find((attribute: ProductInput["variants"][number]["attributes"][number]) =>
    normalizedNames.includes(attribute.name.trim().toLowerCase())
  )?.value;
}

async function productCodeExists(productCode: string) {
  const rows = await db.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Product" WHERE "productCode" = ${productCode} LIMIT 1
  `;

  return rows.length > 0;
}

async function generateUniqueProductCode(context: SkuContext) {
  const prefix = productCodePrefix({
    vendorCode: context.vendorCode,
    productTitle: context.productTitle,
  });
  const existingCodes = await db.product.findMany({
    where: {
      productCode: {
        startsWith: `${prefix}-`,
      },
    },
    select: { productCode: true },
  });
  const maxSerial = existingCodes.reduce((max, row) => {
    const productCode = row.productCode ?? "";
    const suffix = productCode.slice(prefix.length + 1);

    if (!/^\d{3}$/.test(suffix)) {
      return max;
    }

    return Math.max(max, Number(suffix));
  }, 0);

  for (let attempt = 1; attempt <= 999; attempt += 1) {
    const productCode = generateProductCode({
      vendorCode: context.vendorCode,
      productTitle: context.productTitle,
      number: maxSerial + attempt,
    });

    if (!(await productCodeExists(productCode))) {
      return productCode;
    }
  }

  throw new Error("Unable to generate a unique product code.");
}

async function generateUniqueSku(
  input: Omit<SkuInput, "number">,
  reservedSkus: Set<string>,
  startingSerial: number
) {
  for (let serial = startingSerial; serial < startingSerial + 1000; serial += 1) {
    const sku = generateSku({ ...input, number: serial });

    if (reservedSkus.has(sku)) {
      continue;
    }

    const existing = await db.productVariant.findUnique({
      where: { sku },
      select: { id: true },
    });

    if (!existing) {
      reservedSkus.add(sku);
      return sku;
    }
  }

  throw new Error("Unable to generate a unique SKU.");
}

async function generateUniqueBarcode(
  sku: string,
  reservedBarcodes: Set<string>,
  ignoredProductId?: string
) {
  const barcode = barcodeValueFromSku(sku);

  if (reservedBarcodes.has(barcode)) {
    throw new Error(`Duplicate generated barcode: ${barcode}`);
  }

  const existing = await db.productVariant.findFirst({
    where: {
      barcode,
      ...(ignoredProductId ? { productId: { not: ignoredProductId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error(`Generated barcode already exists: ${barcode}`);
  }

  reservedBarcodes.add(barcode);
  return barcode;
}

async function getSkuContext(data: ProductInput): Promise<SkuContext> {
  const [subCategory, user] = await Promise.all([
    data.subCategoryId
      ? db.subCategory.findUnique({
          where: { id: data.subCategoryId },
          select: {
            id: true,
            translations: {
              take: 1,
              select: {
                title: true,
                slug: true,
              },
            },
          },
        })
      : null,
    db.user.findUnique({
      where: { id: data.userId },
      select: {
        id: true,
        sellerProfile: {
          select: {
            code: true,
          },
        },
      },
    }),
  ]);

  const subCategoryLabel =
    subCategory?.translations[0]?.slug ??
    subCategory?.translations[0]?.title ??
    subCategory?.id;
  const defaultTranslation =
    data.translations.find(
      (translation: ProductInput["translations"][number]) =>
        translation.locale === "EN"
    ) ??
    data.translations[0];
  const vendorCode = user?.sellerProfile?.code ?? user?.id ?? "VENDOR";

  return {
    vendorCode,
    productTitle: defaultTranslation?.title ?? data.title,
    subCategory: subCategoryLabel ?? "SUB",
  };
}

async function assertProductUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("Selected product owner was not found. Please sign in again.");
  }
}

async function generateVariantSku(
  variant: ProductInput["variants"][number],
  context: SkuContext,
  reservedSkus: Set<string>,
  serial: number
) {
  const color = variantAttribute(variant, ["color", "colour"]) ?? "CLR";
  const size = variantAttribute(variant, ["size"]) ?? "SIZE";

  return generateUniqueSku(
    {
      ...context,
      color,
      size,
    },
    reservedSkus,
    serial
  );
}

async function toVariantCreateInput(
  variant: ProductInput["variants"][number],
  context: SkuContext,
  reservedSkus: Set<string>,
  reservedBarcodes: Set<string>,
  serial: number,
  productCode: string,
  ignoredProductId?: string
): Promise<unknown> {
  const { id: _id, attributes, wholesalePricing, ...data } = variant;
  void _id;
  const sku =
    data.sku ||
    (await generateVariantSku(variant, context, reservedSkus, serial));
  const barcode = await generateUniqueBarcode(
    sku,
    reservedBarcodes,
    ignoredProductId
  );
  const barcodeUrl = getBarcodeImageUrl(barcode);
  const variantProductCode = data.productCode || productCode;

  return {
    ...data,
    sku,
    barcode,
    barcodeUrl,
    productCode: variantProductCode,
    salePrice: data.salePrice ?? null,
    costPrice: data.costPrice ?? null,
    stock: data.stock ?? null,
    lowStockAlert: data.lowStockAlert ?? null,
    image: data.image ?? null,
    attributes: { create: attributes },
    wholesalePricing: { create: wholesalePricing },
  };
}

async function toVariantUpdateInput(
  variant: ProductInput["variants"][number],
  context: SkuContext,
  reservedSkus: Set<string>,
  reservedBarcodes: Set<string>,
  serial: number,
  productCode: string,
  productId: string
): Promise<unknown> {
  const { id: _id, attributes, wholesalePricing, ...data } = variant;
  void _id;
  const sku =
    data.sku ||
    (await generateVariantSku(variant, context, reservedSkus, serial));
  const barcode = await generateUniqueBarcode(sku, reservedBarcodes, productId);
  const barcodeUrl = getBarcodeImageUrl(barcode);
  const variantProductCode = data.productCode || productCode;

  return {
    ...data,
    sku,
    barcode,
    barcodeUrl,
    productCode: variantProductCode,
    salePrice: data.salePrice ?? null,
    costPrice: data.costPrice ?? null,
    stock: data.stock ?? null,
    lowStockAlert: data.lowStockAlert ?? null,
    image: data.image ?? null,
    attributes: {
      deleteMany: {},
      create: attributes,
    },
    wholesalePricing: {
      deleteMany: {},
      create: wholesalePricing,
    },
  };
}

export async function createProduct(
  input: ProductInput
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const data = productSchema.parse(await autoTranslateProductInput(input));
    const {
      images,
      variants,
      translations,
      vendorCode: _vendorCode,
      imageUrl: _imageUrl,
      ...productData
    } = data;
    void _vendorCode;
    const imageUrl = images[0]?.url ?? _imageUrl;
    await assertProductUser(data.userId);
    const historyActor = await getHistoryActor(data.userId);
    const translationsWithSlug = await withTranslationSlugs(translations);
    const skuContext = await getSkuContext(data);
    const productCode =
      data.productCode || (await generateUniqueProductCode(skuContext));
    const reservedSkus = new Set<string>();
    const reservedBarcodes = new Set<string>();
    const variantsWithSku: Awaited<ReturnType<typeof toVariantCreateInput>>[] = [];

    for (const [index, variant] of variants.entries()) {
      variantsWithSku.push(
        await toVariantCreateInput(
          variant,
          skuContext,
          reservedSkus,
          reservedBarcodes,
          index + 1,
          productCode
        )
      );
    }

    const product = await db.$transaction((tx) =>
      tx.product.create({
        data: {
          ...productData,
          imageUrl,
          productCode,
          images: { create: images },
          variants: {
            create: variantsWithSku,
          },
          translations: { create: translationsWithSlug },
        } as never,
        include: productInclude,
      })
    );

    await createProductBlogAndVlog(product as ProductWithRelations);
    await recordProductCreated(product as ProductWithRelations, historyActor);

    return { success: true, data: product as ProductWithRelations };
  } catch (error: unknown) {
    return productError(error, "CREATE_PRODUCT_ERROR");
  }
}

export async function getProducts(): Promise<ActionResponse<ProductWithRelations[]>>;
export async function getProducts(
  params: ProductQueryParams
): Promise<ActionResponse<ProductListResult>>;
export async function getProducts(
  params?: ProductQueryParams
): Promise<ActionResponse<ProductWithRelations[] | ProductListResult>> {
  try {
    if (params) {
      const page = Math.max(Number(params.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(params.limit ?? 10), 1), 50);
      const search = params.search?.trim() ?? "";
      const skip = (page - 1) * limit;
      const where = search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { slug: { contains: search, mode: "insensitive" as const } },
              {
                translations: {
                  some: {
                    OR: [
                      {
                        title: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        description: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {};

      const [products, total] = await Promise.all([
        db.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: productInclude,
        }),
        db.product.count({ where }),
      ]);

      return {
        success: true,
        data: {
          data: products as ProductWithRelations[],
          total,
        },
      };
    }

    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: productInclude,
    });

    return { success: true, data: products as ProductWithRelations[] };
  } catch (error: unknown) {
    return productError(error, "GET_PRODUCTS_ERROR");
  }
}

export async function getProductById(
  id: string
): Promise<ActionResponse<ProductWithRelations | null>> {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: productInclude,
    });

    return { success: true, data: product as ProductWithRelations | null };
  } catch (error: unknown) {
    return productError(error, "GET_PRODUCT_ERROR");
  }
}

export async function getProductHistory(
  productId: string
): Promise<ActionResponse<ProductHistoryItem[]>> {
  try {
    const history = await db.$queryRaw<ProductHistoryItem[]>`
      SELECT
        "id",
        "productId",
        "productCode",
        "productTitle",
        "action",
        "field",
        "oldValue",
        "newValue",
        "variantId",
        "sku",
        "changedByUserId",
        "changedByUserCode",
        "changedByRole",
        "sellerCode",
        "createdAt"
      FROM "ProductHistory"
      WHERE "productId" = ${productId}
      ORDER BY "createdAt" DESC
    `;

    return { success: true, data: history };
  } catch (error: unknown) {
    return productError(error, "GET_PRODUCT_HISTORY_ERROR");
  }
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const data = productSchema.parse(await autoTranslateProductInput(input));
    const {
      images,
      variants,
      translations,
      vendorCode: _vendorCode,
      imageUrl: _imageUrl,
      ...productData
    } = data;
    void _vendorCode;
    const imageUrl = images[0]?.url ?? _imageUrl;
    await assertProductUser(data.userId);
    const [oldProduct, historyActor] = await Promise.all([
      getProductSnapshot(id),
      getHistoryActor(data.userId),
    ]);
    const translationsWithSlug = await withTranslationSlugs(translations);
    const skuContext = await getSkuContext(data);
    const existingProductCode =
      (oldProduct as { productCode?: string | null } | null)?.productCode ?? null;
    const productCode =
      data.productCode ||
      existingProductCode ||
      (await generateUniqueProductCode(skuContext));
    const reservedSkus = new Set<string>();
    const reservedBarcodes = new Set<string>();
    const existingVariantIds = new Set(
      oldProduct?.variants.map((variant: ProductWithRelations["variants"][number]) => variant.id) ?? []
    );
    const referencedVariantIds = await getVariantsReferencedByOrdersOrSales([
      ...existingVariantIds,
    ]);
    const incomingExistingIds = new Set(
      variants
        .map((variant: ProductInput["variants"][number]) => variant.id)
        .filter((variantId: string | undefined): variantId is string =>
          Boolean(variantId && existingVariantIds.has(variantId))
        )
    );
    const variantCreates = [];
    const variantUpdates = [];

    for (const [index, variant] of variants.entries()) {
      if (variant.id && existingVariantIds.has(variant.id)) {
        variantUpdates.push({
          where: { id: variant.id },
          data: await toVariantUpdateInput(
            variant,
            skuContext,
            reservedSkus,
            reservedBarcodes,
            index + 1,
            productCode,
            id
          ),
        });
        continue;
      }

      variantCreates.push(
        await toVariantCreateInput(
          variant,
          skuContext,
          reservedSkus,
          reservedBarcodes,
          index + 1,
          productCode,
          id
        )
      );
    }

    const deletableVariantIds = [...existingVariantIds].filter(
      (variantId) =>
        !incomingExistingIds.has(variantId) &&
        !referencedVariantIds.has(variantId)
    );
    const productUpdateData: Record<string, unknown> = {
      ...productData,
      imageUrl,
      productCode,
      images: {
        deleteMany: {},
        create: images,
      },
      translations: {
        deleteMany: {},
        create: translationsWithSlug,
      },
    };
    const variantOperations: Record<string, unknown> = {};

    if (deletableVariantIds.length > 0) {
      variantOperations.deleteMany = { id: { in: deletableVariantIds } };
    }

    if (variantUpdates.length > 0) {
      variantOperations.update = variantUpdates;
    }

    if (variantCreates.length > 0) {
      variantOperations.create = variantCreates;
    }

    if (Object.keys(variantOperations).length > 0) {
      productUpdateData.variants = variantOperations;
    }

    const product = await db.product.update({
      where: { id },
      data: productUpdateData as never,
      include: productInclude,
    });

    await recordProductChanges(
      oldProduct,
      product as ProductWithRelations,
      historyActor
    );

    return { success: true, data: product as ProductWithRelations };
  } catch (error: unknown) {
    return productError(error, "UPDATE_PRODUCT_ERROR");
  }
}

export async function deleteProduct(
  id: string
): Promise<ActionResponse<null>> {
  try {
    const product = await getProductSnapshot(id);

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const historyActor = await getHistoryActor(product.userId);
    const referencedIds = await getProductsReferencedByOrdersOrSales([id]);

    if (referencedIds.has(id)) {
      return {
        success: false,
        error:
          "This product is already used in orders or sales, so it cannot be deleted.",
      };
    }

    await recordProductDeleted(product as ProductWithRelations, historyActor);
    await db.product.delete({ where: { id } });

    return { success: true, data: null };
  } catch (error: unknown) {
    return productError(error, "DELETE_PRODUCT_ERROR");
  }
}

export async function bulkDeleteProduct(
  ids: string[]
): Promise<
  ActionResponse<{
    deletedIds: string[];
    blockedIds: string[];
    blockedTitles: string[];
  }>
> {
  try {
    const products = await db.product.findMany({
      where: { id: { in: ids } },
      include: productInclude,
    });
    const historyActor = await getHistoryActor(products[0]?.userId ?? null);
    const referencedIds = await getProductsReferencedByOrdersOrSales(ids);
    const deletableProducts = (products as ProductWithRelations[]).filter(
      (product) => !referencedIds.has(product.id)
    );
    const blockedProducts = (products as ProductWithRelations[]).filter((product) =>
      referencedIds.has(product.id)
    );

    if (deletableProducts.length === 0) {
      return {
        success: false,
        error:
          blockedProducts.length > 0
            ? `${blockedProducts.length} selected product(s) are already used in orders or sales, so they cannot be deleted.`
            : "No matching products found to delete.",
      };
    }

    await writeProductHistory(
      deletableProducts.map((product) => ({
        productId: product.id,
        productCode: productCodeForHistory(product),
        productTitle: product.title,
        action: "DELETE",
        field: "product",
        oldValue: productDeleteSnapshot(product),
        newValue: null,
        variantId: product.variants.find((variant) => variant.isDefault)?.id ?? null,
        sku: product.variants.find((variant) => variant.isDefault)?.sku ?? null,
      })),
      historyActor
    );

    await db.product.deleteMany({
      where: { id: { in: deletableProducts.map((product) => product.id) } },
    });

    return {
      success: true,
      data: {
        deletedIds: deletableProducts.map((product) => product.id),
        blockedIds: blockedProducts.map((product) => product.id),
        blockedTitles: blockedProducts.map((product) => product.title),
      },
    };
  } catch (error: unknown) {
    return productError(error, "BULK_DELETE_PRODUCT_ERROR");
  }
}

function toProductLabelData(
  variant: {
    id: string;
    title: string;
    sku: string | null;
    barcode: string | null;
    productCode: string | null;
    price: number;
    salePrice: number | null;
    stock: number | null;
    product: {
      id: string;
      title: string;
      productCode?: string | null;
    };
  }
): ProductLabelData {
  return {
    productId: variant.product.id,
    variantId: variant.id,
    title: variant.product.title,
    variant: variant.title,
    sku: variant.sku,
    barcode: variant.barcode,
    productCode: variant.product.productCode ?? variant.productCode,
    price: variant.price,
    salePrice: variant.salePrice,
    stock: variant.stock,
  };
}

export async function getProductLabelByCode(
  code: string
): Promise<ActionResponse<ProductLabelData>> {
  try {
    const scanCode = code.trim();

    if (!scanCode) {
      return { success: false, error: "Scan code required" };
    }

    const variant = await db.productVariant.findFirst({
      where: {
        OR: [
          { barcode: scanCode },
          { sku: scanCode },
          { productCode: scanCode },
          { product: { productCode: scanCode } },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            productCode: true,
          },
        },
      },
    });

    if (!variant) {
      return { success: false, error: "Product label not found" };
    }

    return { success: true, data: toProductLabelData(variant) };
  } catch (error: unknown) {
    return productError(error, "GET_PRODUCT_LABEL_ERROR");
  }
}

export async function scanInventoryCode(
  code: string
): Promise<ActionResponse<ProductLabelData>> {
  return getProductLabelByCode(code);
}
