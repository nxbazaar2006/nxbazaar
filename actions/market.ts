"use server";

import { db } from "@/lib/db";
import { marketSchema } from "@/lib/validators/market.schema";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";

export async function createMarket(data: unknown) {
  const parsed = marketSchema.parse(data);

  // 🔥 generate slug per translation
  const translationsWithSlug = await Promise.all(
    parsed.translations.map(async (t) => ({
      ...t,
      slug: await generateUniqueSlug(
        "market",
        t.locale,
        t.slug ?? t.title
      ),
    }))
  );

  const market = await db.market.create({
    data: {
      logoUrl: parsed.logoUrl,
      isActive: parsed.isActive,

      translations: {
        create: translationsWithSlug,
      },

      categories: {
        connect: parsed.categoryIds?.map((id) => ({
          id,
        })),
      },
    },
  });

  return market;
}