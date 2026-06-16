import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";
import { Language } from "@prisma/client";

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function MarketPage({ params }: Props) {
  const { locale, slug } = params;
  const normalizedLocale = locale.toUpperCase() as Language;

  const marketData = await db.market.findFirst({
    where: {
      OR: [
        {
          translations: {
            some: { slug, locale: normalizedLocale },
          },
        },
        {
          translations: {
            some: { slug },
          },
        },
      ],
    },
    include: {
      translations: true,
      categories: {
        include: {
          translations: true,
          products: {
            include: {
              translations: true,
            },
          },
        },
      },
    },
  });

  if (!marketData) return <div>Market not found</div>;

  const t = getSafeTranslation(marketData.translations, locale);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t?.title ?? "Market"}</h1>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {marketData.categories.flatMap((category) => category.products).map((product) => {
          const pt = getSafeTranslation(product.translations, locale);

          return (
            <div key={product.id} className="border p-3 rounded-2xl">
              {pt?.title ?? "Product"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
