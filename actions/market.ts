"use server";

import { db } from "@/lib/db";
import { marketSchema } from "@/lib/validators/market.schema";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";

export async function createMarket(data: unknown) {
  const parsed = marketSchema.parse(data);

  const slug = await generateUniqueSlug("market", parsed.title);

  return db.market.create({
    data: {
      slug,
      title: parsed.title,
      description: parsed.description,
      logoUrl: parsed.logoUrl,
      translations: { create: parsed.translations },

      categories: {
        connect: parsed.categoryIds?.map((id) => ({ id })),
      },
    },
  });
}