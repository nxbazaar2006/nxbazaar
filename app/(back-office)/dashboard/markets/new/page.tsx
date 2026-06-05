import { getCategories } from "@/actions/category";
import NewMarketForm from "@/components/backoffice/NewMarketForm";

type CategoryOptionSource = {
  id: string;
  title?: string | null;
  translations?: {
    title?: string | null;
    slug?: string | null;
  }[];
};

export default async function NewMarket() {
  const categoriesResponse = await getCategories();
  const categoriesData: CategoryOptionSource[] = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : [];

  const categories = categoriesData.map((category) => ({
    label:
      category.title ??
      category.translations?.[0]?.title ??
      category.translations?.[0]?.slug ??
      "Untitled category",
    value: category.id,
  }));

  return <NewMarketForm categories={categories} />;
}
