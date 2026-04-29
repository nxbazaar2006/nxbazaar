import FormHeader from "@/components/backoffice/FormHeader";
import SubCategoryForm from "@/components/backoffice/Forms/SubCategoryForm";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

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

  return (
    <div className="space-y-4">
      <FormHeader title="Update SubCategory" />
      <SubCategoryForm
        updateData={subCategory}
        categories={uniqueCategories}
      />
    </div>
  );
}
