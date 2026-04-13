import { getCategories } from "@/actions/category";
import { getMarketById } from "@/actions/market";
import NewMarketForm from "@/components/backoffice/NewMarketForm";
import type { Category } from "@/types/category";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMarketPage({
  params,
}: Props) {
  const { id } = await params;

  const [marketResponse, categoriesResponse] =
    await Promise.all([
      getMarketById(id),
      getCategories(),
    ]);

  if (!marketResponse.success || !marketResponse.data) {
    return (
      <div className="p-6 text-sm text-red-500">
        Market not found
      </div>
    );
  }

  const categoriesData = Array.isArray(categoriesResponse)
    ? (categoriesResponse as Category[])
    : [];

  const market = marketResponse.data;
  const marketWithCategoryIds = {
    ...market,
    categoryIds:
      market.categories?.map((category) => category.id) ??
      [],
  };

  const categories = categoriesData.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  return (
    <NewMarketForm
      market={marketWithCategoryIds}
      categories={categories}
    />
  );
}
