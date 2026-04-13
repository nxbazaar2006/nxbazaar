import { getCategories } from "@/actions/category";
import NewMarketForm from "@/components/backoffice/NewMarketForm";
import type { Category } from "@/types/category";

export default async function NewMarket() {
  const categoriesResponse = await getCategories();
  const categoriesData = Array.isArray(categoriesResponse)
    ? (categoriesResponse as Category[])
    : [];

  const categories = categoriesData.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  return <NewMarketForm categories={categories} />;
}
