import SubCategoryForm from "@/components/backoffice/Forms/SubCategoryForm";
import { db } from "@/lib/db";

export default async function NewSubCategoryPage() {
  const categories = await db.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCategories = categories.map((item) => ({
    id: item.id,
    title: item.title,
  }));

  return (
    <SubCategoryForm
      categories={formattedCategories}
    />
  );
}