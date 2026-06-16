import CategoriesClient from "./CategoriesClient";
import { getCategories } from "@/actions/category";
import PageHeader from "@/components/backoffice/PageHeader";

export default async function CategoriesPage() {
  const categoriesData = await getCategories();

  // ✅ normalize data
  const categoryList = Array.isArray(categoriesData) ? categoriesData : [];

  const categories = categoryList.map((cat) => {
    const translation = cat.translations[0];

    return {
      id: cat.id,
      title: translation?.title ?? "Category",
      slug: translation?.slug ?? cat.id,
      imageUrl: cat.imageUrl ?? null,
      description: translation?.description ?? null,
      isActive: cat.isActive,
      products: cat.products ?? [],
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
      translations: (cat.translations ?? []).map((item) => ({
        id: `${cat.id}-${item.locale}`,
        locale: item.locale.toLowerCase() as "en" | "hi" | "mr",
        title: item.title,
        description: item.description,
      })),
    };
  });

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
