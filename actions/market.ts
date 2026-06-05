"use server";

import { db } from "@/lib/db";
import { marketSchema } from "@/lib/validators/market.schema";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import type { Market } from "@/types/market";
import { Language } from "@prisma/client";
import { revalidatePath } from "next/cache";

const marketInclude = {
  categories: {
    include: {
      translations: true,
    },
  },
  translations: {
    orderBy: {
      locale: "asc",
    },
  },
} as const;

function toMarketListItem(market: {
  id: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  translations: { title: string; slug: string | null; description: string | null }[];
  categories: {
    id: string;
    translations?: { title: string; slug: string | null }[];
  }[];
}): Market {
  const translation = market.translations[0];

  return {
    id: market.id,
    title: translation?.title ?? "-",
    slug: translation?.slug ?? "",
    logoUrl: market.logoUrl ?? undefined,
    description: translation?.description ?? undefined,
    isActive: market.isActive,
    createdAt: market.createdAt.toISOString(),
    categories: market.categories.map((category) => ({
      id: category.id,
      name:
        category.translations?.[0]?.title ??
        category.translations?.[0]?.slug ??
        "-",
    })),
  };
}

export async function getMarkets() {
  try {
    const markets = await db.market.findMany({
      orderBy: { createdAt: "desc" },
      include: marketInclude,
    });

    return {
      success: true,
      data: markets.map(toMarketListItem),
    };
  } catch (error) {
    console.error("GET_MARKETS_ERROR", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch markets",
      data: [] as Market[],
    };
  }
}

export async function getMarketById(id: string) {
  try {
    const market = await db.market.findUnique({
      where: { id },
      include: marketInclude,
    });

    return {
      success: true,
      data: market
        ? {
            ...toMarketListItem(market),
            translations: market.translations,
            categories: market.categories.map((category) => ({
              id: category.id,
              name:
                category.translations?.[0]?.title ??
                category.translations?.[0]?.slug ??
                "-",
            })),
          }
        : null,
    };
  } catch (error) {
    console.error("GET_MARKET_ERROR", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch market",
      data: null,
    };
  }
}

export async function createMarket(data: unknown) {
  try {
    const parsed = marketSchema.parse(data);

    const translationsWithSlug = await Promise.all(
      parsed.translations.map(async (t) => ({
        locale: t.locale.toUpperCase() as Language,
        title: t.title,
        description: t.description,
        slug: await generateUniqueSlug(
          "market",
          t.locale,
          t.slug ?? t.title
        ),
      }))
    );
    const defaultTranslation = translationsWithSlug[0];

    const market = await db.market.create({
      data: {
        title: defaultTranslation?.title ?? "Market",
        description: defaultTranslation?.description,
        logoUrl: parsed.logoUrl,
        isActive: parsed.isActive,

        translations: {
          create: translationsWithSlug,
        },

        categories: {
          connect: parsed.categoryIds?.map((id) => ({
            id,
          })) ?? [],
        },
      },
      include: marketInclude,
    });

    revalidatePath("/dashboard/markets");

    return { success: true, data: toMarketListItem(market) };
  } catch (error) {
    console.error("CREATE_MARKET_ERROR", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create market",
      data: null,
    };
  }
}

export async function updateMarket(id: string, data: unknown) {
  try {
    const parsed = marketSchema.parse(data);
    const defaultTranslation = parsed.translations[0];

    const market = await db.market.update({
      where: { id },
      data: {
        title: defaultTranslation?.title ?? "Market",
        description: defaultTranslation?.description,
        logoUrl: parsed.logoUrl,
        isActive: parsed.isActive,
        categories: {
          set: parsed.categoryIds?.map((categoryId) => ({
            id: categoryId,
          })) ?? [],
        },
        translations: {
          deleteMany: {},
          create: parsed.translations.map((translation) => ({
            locale: translation.locale.toUpperCase() as Language,
            title: translation.title,
            description: translation.description,
            slug: translation.slug || undefined,
          })),
        },
      },
      include: marketInclude,
    });

    revalidatePath("/dashboard/markets");
    revalidatePath(`/dashboard/markets/update/${id}`);

    return { success: true, data: toMarketListItem(market) };
  } catch (error) {
    console.error("UPDATE_MARKET_ERROR", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update market",
      data: null,
    };
  }
}

export async function deleteMarket(id: string) {
  try {
    await db.market.delete({
      where: { id },
    });

    revalidatePath("/dashboard/markets");

    return { success: true, data: null };
  } catch (error) {
    console.error("DELETE_MARKET_ERROR", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete market",
      data: null,
    };
  }
}
