import { findEntityByTranslationSlug } from "@/lib/slug/translationSlug.service";
import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params;

  const category = await findEntityByTranslationSlug("category", locale, slug);

  // fallback to base slug for old routes
  const categoryData =
    category ??
    (await db.category.findFirst({
      where: { slug },
      include: {
        translations: true,
        subCategories: {
          include: {
            translations: true,
          },
        },
      },
    }));

  if (!categoryData) return <div>Category not found</div>;

  const t = getSafeTranslation(categoryData.translations, locale);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t?.name ?? "Category"}</h1>

      <div className="mt-4 grid gap-3">
        {categoryData.subCategories.map((sub) => {
          const subT = getSafeTranslation(sub.translations, locale);

          return (
            <div key={sub.id} className="border p-3 rounded">
              {subT?.name ?? "SubCategory"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
