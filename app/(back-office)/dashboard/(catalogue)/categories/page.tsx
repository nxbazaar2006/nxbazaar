import PageHeader from "@/components/backoffice/PageHeader";
import CategoriesClient from "./CategoriesClient";
import { getCategories } from "@/actions/category";
import { Category } from "@/types/category";

export default async function CategoriesPage() {
  const categoriesData = await getCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

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
