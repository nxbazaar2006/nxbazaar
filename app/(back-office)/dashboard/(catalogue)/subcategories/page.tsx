import { db } from "@/lib/db";
import PageHeader from "@/components/backoffice/PageHeader";
import SubCategoriesClient from "./SubCategoriesClient";
import { SubCategory } from "@/types/subcategory";

export default async function SubCategoryPage({
  searchParams,
}: {
  searchParams: { locale?: string };
}) {
  const locale = searchParams?.locale?.toUpperCase() || "EN";

 
  const subCategories = await db.subCategory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        include: {
          translations: true,
        },
      },
      hsnCode: true,
      translations: {
        where: {
          locale: {
            in: [locale, "EN"], 
          },
        },
      },
    },
  });

  // ✅ Safe + clean mapping
  const formattedData: SubCategory[] = subCategories.map((item) => {
    const translation =
      item.translations.find((t) => t.locale === locale) ??
      item.translations[0] ??
      null;
    const categoryTranslation =
      item.category.translations.find((t) => t.locale === locale) ??
      item.category.translations.find((t) => t.locale === "EN") ??
      item.category.translations[0] ??
      null;

    return {
      id: item.id,
      slug: item.slug,
      imageUrl: item.imageUrl,
      isActive: item.isActive,
      categoryId: item.categoryId,
      category: item.category
        ? {
            id: item.category.id,
            title: categoryTranslation?.title ?? item.category.slug,
          }
        : null,
      hsnCodeId: item.hsnCodeId ?? null,
      hsnCode: item.hsnCode
        ? {
            id: item.hsnCode.id,
            code: item.hsnCode.code,
            title: item.hsnCode.title,
            gstRate: item.hsnCode.gstRate,
          }
        : null,
      translations: translation
        ? [
            {
              id: translation.id,
              locale: translation.locale.toLowerCase() as SubCategory["translations"][number]["locale"],
              title: translation.title,
              description: translation.description,
            },
          ]
        : [],
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  });

  return (
    <div className="space-y-4">
      <PageHeader
        heading={`SubCategories (${locale})`}
        href="/dashboard/subcategories/new"
        linkTitle="Add SubCategory"
      />

      <SubCategoriesClient initialData={formattedData} />
    </div>
  );
}
