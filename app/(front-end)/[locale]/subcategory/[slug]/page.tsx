import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";
import { Language } from "@prisma/client";

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function SubCategoryPage({ params }: Props) {
  const { locale, slug } = params;
  const normalizedLocale = locale.toUpperCase() as Language;

  const subCategoryData = await db.subCategory.findFirst({
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
      products: {
        include: {
          translations: true,
        },
      },
    },
  });

  if (!subCategoryData) return <div>Not found</div>;

  const t = getSafeTranslation(subCategoryData.translations, locale);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{t?.title ?? "SubCategory"}</h1>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {subCategoryData.products.map((product) => {
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
