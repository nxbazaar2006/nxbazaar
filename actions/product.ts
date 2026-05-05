"use server";

import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  productSchema,
  type ProductInput,
} from "@/lib/validators/productSchema";
import { generateUniqueSlug } from "@/lib/slug/translationSlug";
import { generateBarcode } from "@/lib/generateBarcode";
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
  sellerCode: string;
  categoryCode: string;
  subCategoryCode: string;
  productNameCode: string;
};

type ProductCodeInput = {
  sellerCode: string;
  title: string;
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

type ProductHistoryEntry = {
  productId: string;
  productCode: string | null;
  productTitle: string;
  action: string;
  field?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  variantId?: string | null;
  sku?: string | null;
};

type ProductSnapshot = Awaited<ReturnType<typeof getProductSnapshot>>;

const productInclude = {
  category: true,
  subCategory: true,
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

async function withTranslationSlugs(translations: ProductInput["translations"]) {
  return Promise.all(
    translations.map(async (translation) => ({
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
  product: Pick<ProductWithRelations, "variants"> | null | undefined
) {
  return (
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

function historyActionForField(field: string, variantLevel = false) {
  if (["price", "salePrice", "costPrice"].includes(field)) {
    return "PRICE_CHANGED";
  }

  if (["stock", "reservedStock", "lowStockAlert"].includes(field)) {
    return "STOCK_CHANGED";
  }

  if (["isActive", "isDefault", "trackInventory"].includes(field)) {
    return "STATUS_CHANGED";
  }

  return variantLevel ? "VARIANT_UPDATED" : "PRODUCT_UPDATED";
}

async function getProductSnapshot(id: string) {
  return db.product.findUnique({
    where: { id },
    include: productInclude,
  });
}

async function getHistoryActor(fallbackUserId: string): Promise<ProductHistoryActor> {
  const session = await auth();
  const actorId = session?.user?.id ?? fallbackUserId;

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

async function writeProductHistory(
  entries: ProductHistoryEntry[],
  actor: ProductHistoryActor
) {
  if (entries.length === 0) return;

  try {
    await db.$transaction(
      entries.map((entry) =>
        db.$executeRaw`
          INSERT INTO "ProductHistory" (
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
            "sellerCode"
          ) VALUES (
            ${randomUUID()},
            ${entry.productId},
            ${entry.productCode},
            ${entry.productTitle},
            ${entry.action},
            ${entry.field ?? null},
            ${historyValue(entry.oldValue)},
            ${historyValue(entry.newValue)},
            ${entry.variantId ?? null},
            ${entry.sku ?? null},
            ${actor.changedByUserId},
            ${actor.changedByUserCode},
            ${actor.changedByRole},
            ${actor.sellerCode}
          )
        `
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
        action: "PRODUCT_CREATED",
        field: "product",
        oldValue: null,
        newValue: {
          title: product.title,
          slug: product.slug,
          variants: product.variants.length,
          images: product.images.length,
        },
      },
    ],
    actor
  );
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
      action: "IMAGES_CHANGED",
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
        action: "VARIANT_ADDED",
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
        action: "VARIANT_UPDATED",
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
        action: "VARIANT_UPDATED",
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

function shortCode(
  value: string | null | undefined,
  fallback: string,
  maxLength = 5
) {
  const code = value
    ?.trim()
    .replace(/[^a-z0-9]+/gi, "")
    .toUpperCase()
    .slice(0, maxLength);
  const fallbackCode = fallback
    .replace(/[^a-z0-9]+/gi, "")
    .toUpperCase()
    .slice(0, maxLength);

  return (code || fallbackCode).padEnd(3, fallbackCode[0] ?? "X").slice(0, maxLength);
}

function variantAttribute(
  variant: ProductInput["variants"][number],
  names: string[]
) {
  const normalizedNames = names.map((name) => name.toLowerCase());

  return variant.attributes.find((attribute) =>
    normalizedNames.includes(attribute.name.trim().toLowerCase())
  )?.value;
}

function serialNumber() {
  const time = Date.now().toString(36).toUpperCase().slice(-2);
  const random = Math.random().toString(36).toUpperCase().slice(2, 4);

  return `${time}${random}`;
}

function generateProductCode({ sellerCode, title }: ProductCodeInput) {
  const productName = shortCode(title, "PRD");
  const unique = serialNumber();

  return `PRD-${sellerCode}-${productName}-${unique}`;
}

async function generateUniqueProductCode(input: ProductCodeInput) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateProductCode(input);
    const existing = await db.productVariant.findUnique({
      where: { productCode: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  const fallbackId = randomUUID().replace(/[^a-z0-9]+/gi, "").toUpperCase().slice(0, 4);

  return `PRD-${input.sellerCode}-${shortCode(input.title, "PRD")}-${fallbackId}`;
}

async function generateUniqueBarcode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const barcode = generateBarcode();
    const existing = await db.productVariant.findUnique({
      where: { barcode },
      select: { id: true },
    });

    if (!existing) {
      return barcode;
    }
  }

  return `${Date.now()}${Math.floor(100000 + Math.random() * 900000)}`;
}

async function generateUniqueSku(parts: string[]) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const sku = [...parts, serialNumber()].join("-");
    const existing = await db.productVariant.findUnique({
      where: { sku },
      select: { id: true },
    });

    if (!existing) {
      return sku;
    }
  }

  return [...parts, randomUUID().slice(0, 8).toUpperCase()].join("-");
}

async function getSkuContext(data: ProductInput): Promise<SkuContext> {
  const [vendor, category, subCategory] = await Promise.all([
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
    db.category.findUnique({
      where: { id: data.categoryId },
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
    }),
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
  ]);

  const categoryLabel =
    category?.translations[0]?.slug ??
    category?.translations[0]?.title ??
    category?.id;
  const subCategoryLabel =
    subCategory?.translations[0]?.slug ??
    subCategory?.translations[0]?.title ??
    subCategory?.id;

  return {
    sellerCode: shortCode(vendor?.sellerProfile?.code ?? vendor?.id, "SEL", 5),
    categoryCode: shortCode(categoryLabel, "CAT", 3),
    subCategoryCode: shortCode(subCategoryLabel, "SUB", 3),
    productNameCode: shortCode(data.title, "PRD", 5),
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
  context: SkuContext
) {
  const brandCode = shortCode(
    variantAttribute(variant, ["brand", "brand code", "brandCode"]),
    "BRD",
    5
  );
  const color = shortCode(
    variantAttribute(variant, ["color", "colour"]),
    "CLR",
    5
  );
  const size = shortCode(variantAttribute(variant, ["size"]), "SIZ", 5);

  return generateUniqueSku([
    context.sellerCode,
    context.categoryCode,
    context.subCategoryCode,
    brandCode,
    context.productNameCode,
    color,
    size,
  ]);
}

async function toVariantCreateInput(
  variant: ProductInput["variants"][number],
  title: string,
  context: SkuContext
): Promise<unknown> {
  const { attributes, wholesalePricing, ...data } = variant;
  const productCode =
    data.productCode ||
    (await generateUniqueProductCode({
      sellerCode: context.sellerCode,
      title,
    }));
  const barcode = data.barcode || (await generateUniqueBarcode());
  const sku = data.sku || (await generateVariantSku(variant, context));

  return {
    ...data,
    sku,
    barcode,
    productCode,
    salePrice: data.salePrice ?? null,
    costPrice: data.costPrice ?? null,
    stock: data.stock ?? null,
    lowStockAlert: data.lowStockAlert ?? null,
    image: data.image ?? null,
    attributes: { create: attributes },
    wholesalePricing: { create: wholesalePricing },
  };
}

export async function createProduct(
  input: ProductInput
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const data = productSchema.parse(input);
    const { images, variants, translations, imageUrl: _imageUrl, ...productData } = data;
    void _imageUrl;
    await assertProductUser(data.userId);
    const historyActor = await getHistoryActor(data.userId);
    const translationsWithSlug = await withTranslationSlugs(translations);
    const skuContext = await getSkuContext(data);
    const variantsWithSku = await Promise.all(
      variants.map((variant) =>
        toVariantCreateInput(variant, data.title, skuContext)
      )
    );

    const product = await db.product.create({
      data: {
        ...productData,
        images: { create: images },
        variants: {
          create: variantsWithSku,
        },
        translations: { create: translationsWithSlug },
      } as never,
      include: productInclude,
    });

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
    const data = productSchema.parse(input);
    const { images, variants, translations, imageUrl: _imageUrl, ...productData } = data;
    void _imageUrl;
    await assertProductUser(data.userId);
    const [oldProduct, historyActor] = await Promise.all([
      getProductSnapshot(id),
      getHistoryActor(data.userId),
    ]);
    const translationsWithSlug = await withTranslationSlugs(translations);
    const skuContext = await getSkuContext(data);
    const variantsWithSku = await Promise.all(
      variants.map((variant) =>
        toVariantCreateInput(variant, data.title, skuContext)
      )
    );

    const product = await db.product.update({
      where: { id },
      data: {
        ...productData,
        images: {
          deleteMany: {},
          create: images,
        },
        variants: {
          deleteMany: {},
          create: variantsWithSku,
        },
        translations: {
          deleteMany: {},
          create: translationsWithSlug,
        },
      } as never,
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
    await db.product.delete({ where: { id } });

    return { success: true, data: null };
  } catch (error: unknown) {
    return productError(error, "DELETE_PRODUCT_ERROR");
  }
}

export async function bulkDeleteProduct(
  ids: string[]
): Promise<ActionResponse<null>> {
  try {
    await db.product.deleteMany({
      where: { id: { in: ids } },
    });

    return { success: true, data: null };
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
    productCode: variant.productCode,
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
        OR: [{ barcode: scanCode }, { sku: scanCode }, { productCode: scanCode }],
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
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
