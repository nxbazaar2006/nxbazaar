import SubCategoryForm from "@/components/backoffice/Forms/SubCategoryForm";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function UpdateSubCategoryPage({
  params,
}: Props) {
  const { id } = await params;

  const [subCategory, categories] = await Promise.all([
    db.subCategory.findUnique({
      where: { id },
    }),
    db.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  if (!subCategory) {
    return notFound();
  }

  const formattedCategories = categories.map((item) => ({
    id: item.id,
    title: item.title,
  }));

  const formattedSubCategory = {
    id: subCategory.id,
    title: subCategory.title,
    description: subCategory.description ?? "",
    imageUrl: subCategory.imageUrl ?? "",
    isActive: subCategory.isActive,
    categoryId: subCategory.categoryId,
    hsnCodeId: subCategory.hsnCodeId ?? null,
    metaTitle: subCategory.metaTitle ?? "",
    metaDescription: subCategory.metaDescription ?? "",
  };

  return (
    <SubCategoryForm
      categories={formattedCategories}
      updateData={formattedSubCategory}
    />
  );
}