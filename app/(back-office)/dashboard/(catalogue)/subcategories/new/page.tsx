import SubCategoryForm from "@/components/backoffice/Forms/SubCategoryForm";
import { db } from "@/lib/db";
import { Prisma, HsnCode } from "@prisma/client";

type PageProps = {
  searchParams: Promise<{
    locale?: string;
  }>;
};

type CategoryWithTranslations = Prisma.CategoryGetPayload<{
  include: { translations: true };
}>;

export default async function NewSubCategoryPage({
  searchParams,
}: PageProps) {
  // ✅ MUST in Next.js 16
  const { locale = "EN" } = await searchParams;

  const upperLocale = locale.toUpperCase();

  let categories: CategoryWithTranslations[] = [];
  let hsnCodes: HsnCode[] = [];

  try {
    [categories, hsnCodes] = await Promise.all([
      db.category.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          translations: true,
        },
      }),
      db.hsnCode.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);
  } catch (error) {
    console.error("❌ Data fetching error:", error);
  }

  const formattedCategories = categories.map((item) => {
    const translation =
      item.translations.find((t) => t.locale === upperLocale) ??
      item.translations.find((t) => t.locale === "EN");

    return {
      id: item.id,
      title: translation?.title?.trim() || "Untitled",
    };
  });

  // ✅ duplicate fix (good)
  const uniqueCategories = Array.from(
    new Map(formattedCategories.map((c) => [c.id, c])).values()
  );

  return (
    <div className="space-y-4">
      <SubCategoryForm
        categories={uniqueCategories}
        hsnCodes={hsnCodes}
      />
    </div>
  );
}