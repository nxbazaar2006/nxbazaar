import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = params;

  const product = await db.product.findFirst({
    where: { slug },
    include: {
      translations: true,
      category: true,
      subCategory: true,
      market: true,
    },
  });

  if (!product) return <div>Product not found</div>;

  const t = getSafeTranslation(product.translations, locale);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t?.name ?? "Product"}</h1>
      <p className="text-gray-600 mt-2">
        {t?.description ?? "No description"}
      </p>

      <div className="mt-4 text-sm text-gray-500">
        Category: {product.category?.slug}
      </div>
    </div>
  );
}