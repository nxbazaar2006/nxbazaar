"use server";

import { db } from "@/lib/db";
import { marketSchema, MarketInput } from "@/lib/validators/market.schema";
import { generateSlug } from "@/lib/utils/slug";
import { revalidatePath } from "next/cache";

/* ================================
   HELPERS
================================ */

async function generateUniqueSlug(title: string, customSlug?: string) {
  const base = customSlug || generateSlug(title);
  let slug = base;
  let count = 1;

  while (true) {
    const exists = await db.market.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!exists) break;

    slug = `${base}-${count}`;
    count++;
  }

  return slug;
}

/* ================================
   CREATE MARKET
================================ */

export async function createMarket(
  data: unknown
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const parsed = marketSchema.parse(data);

    // 🔥 collision-safe slug
    const slug = await generateUniqueSlug(parsed.title, parsed.slug);

    const market = await db.market.create({
      data: {
        title: parsed.title,
        slug,
        description: parsed.description ?? null,
        logoUrl: parsed.logoUrl ?? null,
        isActive: parsed.isActive ?? true,

        // ✅ categories
        categories: parsed.categoryIds?.length
          ? {
              connect: parsed.categoryIds.map((id) => ({ id })),
            }
          : undefined,

        // ✅ translations
        translations: parsed.translations?.length
          ? {
              create: await Promise.all(
                parsed.translations.map(async (t) => ({
                  locale: t.locale,
                  title: t.title,
                  description: t.description ?? null,
                  slug: await generateUniqueSlug(t.title, t.slug),
                }))
              ),
            }
          : undefined,
      },
      include: {
        categories: true,
        translations: true,
      },
    });

    revalidatePath("/dashboard/markets");

    return { success: true, data: market };
  } catch (error: any) {
    console.error("CREATE MARKET ERROR:", error);

    return {
      success: false,
      message: error?.message || "Failed to create market",
    };
  }
}

/* ================================
   GET ALL MARKETS
================================ */

export async function getMarkets() {
  return db.market.findMany({
    orderBy: { createdAt: "desc" },

    // 🚀 performance optimization
    select: {
      id: true,
      title: true,
      slug: true,
      isActive: true,
      createdAt: true,
      logoUrl: true,

      categories: {
        select: { id: true, title: true },
      },

      translations: {
        select: {
          id: true,
          locale: true,
          title: true,
        },
      },
    },
  });
}

/* ================================
   GET BY ID
================================ */

export async function getMarketById(id: string) {
  return db.market.findUnique({
    where: { id },

    include: {
      categories: true,
      translations: true,
    },
  });
}

/* ================================
   UPDATE MARKET
================================ */

export async function updateMarket(
  id: string,
  data: MarketInput
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const parsed = marketSchema.parse(data);

    // 🔥 regenerate slug safely
    const slug = await generateUniqueSlug(parsed.title, parsed.slug);

    const market = await db.market.update({
      where: { id },

      data: {
        title: parsed.title,
        slug,
        description: parsed.description ?? null,
        logoUrl: parsed.logoUrl ?? null,
        isActive: parsed.isActive ?? true,

        // ✅ replace categories
        categories: parsed.categoryIds?.length
          ? {
              set: parsed.categoryIds.map((id) => ({ id })),
            }
          : { set: [] },

        // 🔥 SAFE TRANSLATION RESET
        translations: {
          deleteMany: {},
          create: await Promise.all(
            parsed.translations.map(async (t) => ({
              locale: t.locale,
              title: t.title,
              description: t.description ?? null,
              slug: await generateUniqueSlug(t.title, t.slug),
            }))
          ),
        },
      },

      include: {
        categories: true,
        translations: true,
      },
    });

    revalidatePath("/dashboard/markets");

    return { success: true, data: market };
  } catch (error: any) {
    console.error("UPDATE MARKET ERROR:", error);

    return {
      success: false,
      message: error?.message || "Failed to update market",
    };
  }
}

/* ================================
   DELETE
================================ */

export async function deleteMarket(id: string) {
  try {
    await db.market.delete({
      where: { id },
    });

    revalidatePath("/dashboard/markets");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Delete failed",
    };
  }
}

/* ================================
   BULK DELETE
================================ */

export async function bulkDeleteMarkets(ids: string[]) {
  try {
    await db.market.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/dashboard/markets");

    return {
      success: true,
      message: "Markets deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Bulk delete failed",
    };
  }
}