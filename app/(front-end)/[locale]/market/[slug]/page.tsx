import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function MarketPage({ params }: Props) {
  const { locale, slug } = params;

  const market = await db.market.findFirst({
    where: { slug },
    include: {
      translations: true,
      products: {
        include: {
          translations: true,
        },
      },
    },
  });

  if (!market) return <div>Market not found</div>;

  const t = getSafeTranslation(market.translations, locale);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t?.name ?? "Market"}</h1>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {market.products.map((product) => {
          const pt = getSafeTranslation(product.translations, locale);

          return (
            <div key={product.id} className="border p-3 rounded">
              {pt?.name ?? "Product"}
            </div>
          );
        })}
      </div>
    </div>
  );
}