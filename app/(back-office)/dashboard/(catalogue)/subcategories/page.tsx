


import { db } from "@/lib/db";
import PageHeader from "@/components/backoffice/PageHeader";
import SubCategoriesClient from "./SubCategoriesClient";
import { SubCategory } from "@/types/subcategory";

export default async function SubCategoryPage() {
  const subCategories = await db.subCategory.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      hsnCode: true,
    },
  });

  const formattedData: SubCategory[] = subCategories.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    slug: item.slug,
    imageUrl: item.imageUrl,
    isActive: item.isActive,
    categoryId: item.categoryId,
    hsnCodeId: item.hsnCodeId ?? "",
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    metaTitle: item.metaTitle ?? "",
    metaDescription: item.metaDescription ?? "",
  }));

  return (
    <div>
      <PageHeader
        heading="SubCategories"
        href="/dashboard/subcategories/new"
        linkTitle="Add SubCategory"
      />

      <div className="py-4">
        <SubCategoriesClient initialData={formattedData} />
      </div>
    </div>
  );
}