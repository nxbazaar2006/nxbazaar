import PageHeader from "@/components/backoffice/PageHeader";
import CategoriesClient from "./CategoriesClient";
import { db } from "@/lib/db";
import { Category } from "@/types/category";

/**
 * Server-side fetch categories
 */
async function getCategories(): Promise<Category[]> {
  const categories = await db.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      translations: true,
      products: true,
    },
  });

  return categories;
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-4">
      <PageHeader
        heading="Categories"
        href="/dashboard/categories/new"
        linkTitle="Add Category"
      />

      <CategoriesClient initialData={categories ?? []} />
    </div>
  );
}