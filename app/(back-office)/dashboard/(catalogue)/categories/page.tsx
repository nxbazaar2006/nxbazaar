import CategoriesClient from "./CategoriesClient";
import { getCategories } from "@/actions/category";

export default async function CategoriesPage() {
  const res = await getCategories();

  // ✅ unwrap + normalize
  const categories = (res.data ?? []).map((cat) => ({
    id: cat.id,
    imageUrl: cat.imageUrl ?? null,
    isActive: cat.isActive,
    createdAt: cat.createdAt,
    translations: cat.translations ?? [],
  }));

  return (
    <div className="p-6 space-y-6">
      <CategoriesClient initialData={categories} />
    </div>
  );
}