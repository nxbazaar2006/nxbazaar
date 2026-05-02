import { findEntityByTranslationSlug } from "@/lib/slug/translationSlug.service";
import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function SubCategoryPage({ params }: Props) {
  const { locale, slug } = params;

  const subCategory = await findEntityByTranslationSlug("subcategory", locale, slug);

  const subCategoryData =
    subCategory ??
    (await db.subCategory.findFirst({
      where: { slug },
      include: {
        translations: true,
        products: {
          include: {
            translations: true,
          },
        },
      },
    }));

  if (!subCategoryData) return <div>Not found</div>;

  const t = getSafeTranslation(subCategoryData.translations, locale);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{t?.name ?? "SubCategory"}</h1>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {subCategoryData.products.map((product) => {
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
