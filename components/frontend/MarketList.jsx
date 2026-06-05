import React from "react";
import MarketsCarousel from "./MarketsCarousel";
import { db } from "@/lib/db";

export default async function MarketList() {
  const dbMarkets = await db.market.findMany({
    where: {
      isActive: true,
    },
    include: {
      translations: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const markets = dbMarkets
    .map((market) => {
      const translation =
        market.translations.find((item) => item.locale === "EN") ??
        market.translations[0];

      return {
        slug: translation?.slug,
        title: translation?.title ?? market.title,
        logoUrl: market.logoUrl || "/placeholder.png",
      };
    })
    .filter((market) => market.slug);

  return (
    <div className="py-16 text-slate-950 dark:text-white">
      {/* Market Slider */}
      <div className="apple-glass p-4">
        <h2 className="mb-4 py-2 text-center text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Shop By Market
        </h2>
        <MarketsCarousel markets={markets} />
      </div>
    </div>
  );
}
