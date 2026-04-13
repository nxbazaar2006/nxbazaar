"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { productSchema } from "@/lib/validators/productSchema";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

/* ================================
   HELPERS
================================ */

function buildSlug(title: string, slug?: string) {
  return slug || slugify(title, { lower: true });
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/* ================================
   CREATE PRODUCT
================================ */

export async function createProduct(data: unknown) {
  try {
    const userId = await requireUser();

    const parsed = productSchema.parse(data);

    const slug = buildSlug(parsed.title, parsed.slug);

    const exists = await db.product.findUnique({
      where: { slug },
    });

    if (exists) {
      return { success: false, message: "Slug already exists" };
    }

    const product = await db.product.create({
      data: {
        title: parsed.title,
        slug,

        description: parsed.description ?? null,
        imageUrl:
          parsed.productImages?.[0] || parsed.imageUrl || null,

        tags: parsed.tags,
        unit: parsed.unit,

        isActive: parsed.isActive,
        isWholesale: parsed.isWholesale,

        currency: parsed.currency,

        user: {
          connect: { id: userId },
        },

        category: parsed.categoryId
          ? { connect: { id: parsed.categoryId } }
          : undefined,

        subCategory: parsed.subCategoryId
          ? { connect: { id: parsed.subCategoryId } }
          : undefined,

        hsnCode: parsed.hsnCodeId
          ? { connect: { id: parsed.hsnCodeId } }
          : undefined,

        // ✅ images
        images: {
          create: parsed.productImages.map((url, i) => ({
            url,
            isPrimary: i === 0,
          })),
        },

        // ✅ variants
        variants: {
          create: parsed.variants.map((v) => ({
            ...v,

            attributes: v.attributes?.length
              ? { create: v.attributes }
              : undefined,

            wholesalePricing: v.wholesalePricing?.length
              ? { create: v.wholesalePricing }
              : undefined,
          })),
        },

        // ✅ translations
        translations: {
          create: parsed.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            description: t.description ?? null,
          })),
        },
      },

      include: {
        category: true,
        subCategory: true,
        hsnCode: true,
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
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/* ================================
   UPDATE PRODUCT
================================ */

export async function updateProduct(data: unknown) {
  try {
    const userId = await requireUser();

    const parsed = productSchema.parse(data);

    if (!parsed.id) {
      return { success: false, message: "Product ID required" };
    }

    const product = await db.product.findUnique({
      where: { id: parsed.id },
    });

    if (!product || product.userId !== userId) {
      return { success: false, message: "Not allowed" };
    }

    const updated = await db.product.update({
      where: { id: parsed.id },

      data: {
        title: parsed.title,
        slug: buildSlug(parsed.title, parsed.slug),

        description: parsed.description ?? null,
        imageUrl:
          parsed.productImages?.[0] || parsed.imageUrl || null,

        tags: parsed.tags,
        unit: parsed.unit,

        isActive: parsed.isActive,
        isWholesale: parsed.isWholesale,

        currency: parsed.currency,

        category: parsed.categoryId
          ? { connect: { id: parsed.categoryId } }
          : { disconnect: true },

        subCategory: parsed.subCategoryId
          ? { connect: { id: parsed.subCategoryId } }
          : { disconnect: true },

        hsnCode: parsed.hsnCodeId
          ? { connect: { id: parsed.hsnCodeId } }
          : { disconnect: true },

        // 🔥 enterprise तरीका
        images: {
          deleteMany: {},
          create: parsed.productImages.map((url, i) => ({
            url,
            isPrimary: i === 0,
          })),
        },

        variants: {
          deleteMany: {},
          create: parsed.variants.map((v) => ({
            ...v,
            attributes: v.attributes?.length
              ? { create: v.attributes }
              : undefined,
            wholesalePricing: v.wholesalePricing?.length
              ? { create: v.wholesalePricing }
              : undefined,
          })),
        },

        translations: {
          deleteMany: {},
          create: parsed.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            description: t.description ?? null,
          })),
        },
      },

      include: {
        category: true,
        subCategory: true,
        hsnCode: true,
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
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/* ================================
   DELETE PRODUCT
================================ */

export async function deleteProduct(id: string) {
  try {
    const userId = await requireUser();

    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product || product.userId !== userId) {
      return { success: false, message: "Not allowed" };
    }

    await db.product.delete({
      where: { id },
    });

    revalidatePath("/dashboard/products");

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/* ================================
   GET PRODUCTS
================================ */

export async function getProducts() {
  const userId = await requireUser();

  return db.product.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },

    include: {
      category: true,
      subCategory: true,
      hsnCode: true,
      variants: {
        include: {
          attributes: true,
          wholesalePricing: true,
        },
      },
      translations: true,
    },
  });
}

/* ================================
   GET SINGLE
================================ */

export async function getProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      subCategory: true,
      hsnCode: true,
      variants: {
        include: {
          attributes: true,
          wholesalePricing: true,
        },
      },
      translations: true,
    },
  });
}