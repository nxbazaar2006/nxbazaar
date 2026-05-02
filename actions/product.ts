"use server";

import { db } from "@/lib/db";
import {
  productSchema,
  type ProductInput,
} from "@/lib/validators/productSchema";
import { generateUniqueSlug } from "@/lib/slug/translationSlug";
import { generateUserCode } from "@/lib/generateUserCode";
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

function toVariantCreateInput(
  variant: ProductInput["variants"][number],
  title: string
): unknown {
  const { attributes, wholesalePricing, ...data } = variant;
  const productCode = data.productCode ?? generateUserCode("LLP", title);

  return {
    ...data,
    sku: data.sku ?? null,
    barcode: data.barcode ?? null,
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
    const { images, variants, translations, ...productData } = data;
    const translationsWithSlug = await withTranslationSlugs(translations);

    const product = await db.product.create({
      data: {
        ...productData,
        images: { create: images },
        variants: {
          create: variants.map((variant) =>
            toVariantCreateInput(variant, data.title)
          ),
        },
        translations: { create: translationsWithSlug },
      } as never,
      include: productInclude,
    });

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

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const data = productSchema.parse(input);
    const { images, variants, translations, ...productData } = data;
    const translationsWithSlug = await withTranslationSlugs(translations);

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
          create: variants.map((variant) =>
            toVariantCreateInput(variant, data.title)
          ),
        },
        translations: {
          deleteMany: {},
          create: translationsWithSlug,
        },
      } as never,
      include: productInclude,
    });

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
