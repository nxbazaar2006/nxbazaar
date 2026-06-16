import FormHeader from "@/components/backoffice/FormHeader";
import SubCategoryForm from "@/components/backoffice/Forms/SubCategoryForm";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import type { SubCategory } from "@/types/subcategory";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    locale?: string;
  }>;
};

type CategoryWithTranslations = Prisma.CategoryGetPayload<{
  include: { translations: true };
}>;

export default async function UpdateSubCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { locale = "EN" } = await searchParams;
  const upperLocale = locale.toUpperCase();

  const [subCategory, categories] = await Promise.all([
    db.subCategory.findUnique({
      where: { id },
      include: {
        translations: true,
        category: true,
        hsnCode: true,
      },
    }),
    db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        translations: true,
      },
    }),
  ]);

  if (!subCategory) {
    notFound();
  }

  const formattedCategories = categories.map((item: CategoryWithTranslations) => {
    const translation =
      item.translations.find((t) => t.locale === upperLocale) ??
      item.translations.find((t) => t.locale === "EN") ??
      item.translations[0];

    return {
      id: item.id,
      title: translation?.title?.trim() || "Untitled",
    };
  });

  const uniqueCategories = Array.from(
    new Map(formattedCategories.map((category) => [category.id, category])).values()
  );

  const selectedTranslation =
    subCategory.translations.find((t) => t.locale === upperLocale) ??
    subCategory.translations.find((t) => t.locale === "EN") ??
    subCategory.translations[0] ??
    null;

  const updateData: SubCategory = {
    id: subCategory.id,
    slug: selectedTranslation?.slug ?? subCategory.id,
    imageUrl: subCategory.imageUrl,
    isActive: subCategory.isActive,
    categoryId: subCategory.categoryId,
    category: null,
    hsnCodeId: subCategory.hsnCodeId,
    hsnCode: subCategory.hsnCode
      ? {
          id: subCategory.hsnCode.id,
          code: subCategory.hsnCode.code,
          title: subCategory.hsnCode.title,
          gstRate: subCategory.hsnCode.gstRate,
        }
      : null,
    translations: selectedTranslation
      ? [
          {
            id: selectedTranslation.id,
            locale: selectedTranslation.locale.toLowerCase() as SubCategory["translations"][number]["locale"],
            title: selectedTranslation.title,
            description: selectedTranslation.description,
          },
        ]
      : [],
    createdAt: subCategory.createdAt.toISOString(),
    updatedAt: subCategory.updatedAt.toISOString(),
  };

  return (
    <div className="space-y-4">
      <FormHeader title="Update SubCategory" />
      <SubCategoryForm
        updateData={updateData}
        categories={uniqueCategories}
      />
    </div>
  );
}
