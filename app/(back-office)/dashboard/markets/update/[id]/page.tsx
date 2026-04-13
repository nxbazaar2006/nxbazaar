import { getCategories } from "@/actions/category";
import { getMarketById } from "@/actions/market";
import NewMarketForm from "@/components/backoffice/NewMarketForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMarketPage({
  params,
}: Props) {
  /* ================================
     GET PARAMS
  ================================ */
  const { id } = await params;

  /* ================================
     FETCH DATA
  ================================ */
  const [marketResponse, categoriesResponse] =
    await Promise.all([
      getMarketById(id),
      getCategories(),
    ]);

  /* ================================
     HANDLE MARKET NOT FOUND
  ================================ */
  if (!marketResponse.success || !marketResponse.data) {
    return (
      <div className="p-6 text-sm text-red-500">
        Market not found
      </div>
    );
  }

  /* ================================
     HANDLE CATEGORY FETCH FAILURE
  ================================ */
  if (!categoriesResponse.success) {
    return (
      <div className="p-6 text-sm text-red-500">
        Failed to load categories
      </div>
    );
  }

  const market = marketResponse.data;
  const categoriesData = categoriesResponse.data ?? [];

  /* ================================
     PREPARE FORM DATA
  ================================ */
  const marketWithCategoryIds = {
    ...market,
    categoryIds:
      market.categories?.map((category) => category.id) ??
      [],
  };

  /* ================================
     CATEGORY OPTIONS
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
      market={marketWithCategoryIds}
      categories={categories}
    />
  );
}