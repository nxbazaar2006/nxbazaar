import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = params;

  const category = await db.category.findFirst({
    where: { slug },
    include: {
      translations: true,
      subCategories: {
        include: {
          translations: true,
        },
      },
    },
  });

  if (!category) return <div>Category not found</div>;

  const t = getSafeTranslation(category.translations, locale);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t?.name ?? "Category"}</h1>

      <div className="mt-4 grid gap-3">
        {category.subCategories.map((sub) => {
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