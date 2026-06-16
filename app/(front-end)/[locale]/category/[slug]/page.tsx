import { db } from "@/lib/db";
import { getSafeTranslation } from "@/lib/getTranslation";
import { Language } from "@prisma/client";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  const normalizedLocale = locale.toUpperCase() as Language;

  const categoryData = await db.category.findFirst({
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
      subCategories: {
        include: {
          translations: true,
        },
      },
    },
  });

  if (!categoryData) return <div>Category not found</div>;

  const t = getSafeTranslation(categoryData.translations, locale);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t?.title ?? "Category"}</h1>

      <div className="mt-4 grid gap-3">
        {categoryData.subCategories.map((sub) => {
          const subT = getSafeTranslation(sub.translations, locale);

          return (
            <div key={sub.id} className="border p-3 rounded-2xl">
              {subT?.title ?? "SubCategory"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
