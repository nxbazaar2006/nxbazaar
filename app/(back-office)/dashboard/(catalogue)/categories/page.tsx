import CategoriesClient from "./CategoriesClient";
import { getCategories } from "@/actions/category";
import PageHeader from "@/components/backoffice/PageHeader";

export default async function CategoriesPage() {
  const categoriesData = await getCategories();

  // ✅ normalize data
  const categories = (categoriesData ?? []).map((cat) => ({
    id: cat.id,
    imageUrl: cat.imageUrl ?? null,
    isActive: cat.isActive,
    createdAt: cat.createdAt,
    translations: cat.translations ?? [],
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        heading="Categories"
        subHeading="Manage your categories"
        href="/dashboard/categories/new"
        linkTitle="Add Category"
      />

      <CategoriesClient initialData={categories} />
    </div>
  );
}
