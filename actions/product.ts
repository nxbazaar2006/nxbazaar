"use server";

import { db } from "@/lib/db";
import { productSchema, type ProductInput } from "@/lib/validators/productSchema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { ProductWithRelations } from "@/types/product";

/* ================= COMMON ================= */

type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const SORT_FIELDS = ["createdAt", "title"] as const;
type SortField = (typeof SORT_FIELDS)[number];

/* ================= CREATE ================= */

export async function createProduct(
  input: ProductInput
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const data = productSchema.parse(input);
    const { images, variants, translations, ...productData } = data;

    const product = await db.product.create({
      data: {
        ...productData,
        images: { create: images },
        variants: {
          create: variants.map((v) => ({
            ...v,
            attributes: { create: v.attributes },
            wholesalePricing: { create: v.wholesalePricing },
          })),
        },
        translations: { create: translations },
      },
      include: {
        category: true,
        subCategory: true,
        hsnCode: true,
        images: true,
        variants: {
          include: {
            attributes: true,
            wholesalePricing: true,
          },
        },
        translations: true,
      },
    });

    revalidatePath("/dashboard/products");

    return { success: true, data: product };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Invalid data" };
    }
    return { success: false, error: "Create failed" };
  }
}

/* ================= GET BY ID ================= */

export async function getProductById(
  id: string
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        hsnCode: true,
        images: true,
        variants: {
          include: {
            attributes: true,
            wholesalePricing: true,
          },
        },
        translations: true,
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: product };
  } catch {
    return { success: false, error: "Fetch failed" };
  }
}

/* ================= UPDATE ================= */

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const data = productSchema.parse(input);
    const { images, variants, translations, ...productData } = data;

    const updated = await db.product.update({
      where: { id },
      data: {
        ...productData,
        images: { deleteMany: {}, create: images },
        variants: {
          deleteMany: {},
          create: variants.map((v) => ({
            ...v,
            attributes: { create: v.attributes },
            wholesalePricing: { create: v.wholesalePricing },
          })),
        },
        translations: { deleteMany: {}, create: translations },
      },
      include: {
        category: true,
        subCategory: true,
        hsnCode: true,
        images: true,
        variants: {
          include: {
            attributes: true,
            wholesalePricing: true,
          },
        },
        translations: true,
      },
    });

    revalidatePath("/dashboard/products");

    return { success: true, data: updated };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Invalid data" };
    }
    return { success: false, error: "Update failed" };
  }
}

/* ================= DELETE ================= */

export async function deleteProduct(
  id: string
): Promise<ActionResponse<null>> {
  try {
    await db.product.delete({ where: { id } });

    revalidatePath("/dashboard/products");

    return { success: true, data: null };
  } catch {
    return { success: false, error: "Delete failed" };
  }
}

/* ================= BULK DELETE ================= */

export async function bulkDeleteProduct(
  ids: string[]
): Promise<ActionResponse<null>> {
  try {
    await db.product.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/dashboard/products");

    return { success: true, data: null };
  } catch {
    return { success: false, error: "Bulk delete failed" };
  }
}

/* ================= GET PRODUCTS ================= */

type GetProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sort?: SortField;
  order?: "asc" | "desc";
};

export async function getProducts(
  params: GetProductsParams = {}
): Promise<
  ActionResponse<{
    data: ProductWithRelations[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>
> {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      categoryId,
      isActive,
      sort = "createdAt",
      order = "desc",
    } = params;

    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 10;
    const skip = (safePage - 1) * safeLimit;

    const filters: Prisma.ProductWhereInput[] = [];

    if (search) {
      filters.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (categoryId) filters.push({ categoryId });
    if (typeof isActive === "boolean") filters.push({ isActive });

    const where: Prisma.ProductWhereInput =
      filters.length ? { AND: filters } : {};

    const sortField: SortField = SORT_FIELDS.includes(sort)
      ? sort
      : "createdAt";

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { [sortField]: order },
        include: {
          category: true,
          subCategory: true,
          hsnCode: true,
          images: true,
          variants: {
            include: {
              attributes: true,
              wholesalePricing: true,
            },
          },
          translations: true,
        },
      }),
      db.product.count({ where }),
    ]);

    return {
      success: true,
      data: {
        data: products,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR:", error);
    return { success: false, error: "Fetch failed" };
  }
}