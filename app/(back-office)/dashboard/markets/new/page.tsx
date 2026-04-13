import { getCategories } from "@/actions/category";
import NewMarketForm from "@/components/backoffice/NewMarketForm";

export default async function NewMarket() {
  /* ================================
     FETCH CATEGORIES
  ================================ */
  const categoriesResponse = await getCategories();

  /* ================================
     HANDLE ERROR
  ================================ */
  if (!categoriesResponse.success) {
    return (
      <div className="p-6 text-sm text-red-500">
        Failed to load categories
      </div>
    );
  }

  const categoriesData = categoriesResponse.data ?? [];

  /* ================================
     MAP OPTIONS
  ================================ */
  const categories = categoriesData.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  /* ================================
     RENDER FORM
  ================================ */
  return (
    <NewMarketForm
      categories={categories}
    />
  );
}