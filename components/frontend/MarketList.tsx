import MarketsCarousel from "./MarketsCarousel";
import { db } from "@/lib/db";

type MarketListProps = {
  lang?: string;
};

type MarketItem = {
  slug: string;
  title: string;
  logoUrl: string;
};

function normalizeLocale(locale?: string) {
  return ["hi", "mr"].includes(locale ?? "") ? locale!.toUpperCase() : "EN";
}

export default async function MarketList({ lang }: MarketListProps = {}) {
  const locale = normalizeLocale(lang);

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
        market.translations.find((item) => item.locale === locale) ??
        market.translations.find((item) => item.locale === "EN") ??
        market.translations[0];

      return {
        slug: translation?.slug ?? "",
        title: translation?.title ?? market.title,
        logoUrl: market.logoUrl || "/placeholder.png",
      };
    })
    .filter((market): market is MarketItem => Boolean(market.slug));

  return (
    <div className="py-12 text-slate-950 dark:text-white">
      <div className="border bg-card text-card-foreground shadow-sm rounded-2xl p-4">
        <h2 className="mb-4 bg-gradient-to-r from-orange-500 via-sky-500 to-yellow-400 bg-clip-text py-2 text-center text-2xl font-semibold tracking-tight text-transparent dark:from-orange-300 dark:via-sky-300 dark:to-yellow-200">
          Shop By Market
        </h2>
        <MarketsCarousel markets={markets} lang={lang} />
      </div>
    </div>
  );
}
