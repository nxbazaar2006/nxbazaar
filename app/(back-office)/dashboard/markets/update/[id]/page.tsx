import { getCategories } from "@/actions/category";
import { getMarketById } from "@/actions/market";
import NewMarketForm from "@/components/backoffice/NewMarketForm";

type CategoryOptionSource = {
  id: string;
  title?: string | null;
  translations?: {
    title?: string | null;
    slug?: string | null;
  }[];
};

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

  const categoriesData: CategoryOptionSource[] = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : [];

  const market = marketResponse.data;
  const marketWithCategoryIds = {
    ...market,
    categoryIds:
      market.categories?.map((category) => category.id) ??
      [],
  };

  const categories = categoriesData.map((category) => ({
    label:
      category.title ??
      category.translations?.[0]?.title ??
      category.translations?.[0]?.slug ??
      "Untitled category",
    value: category.id,
  }));

  return (
    <NewMarketForm
      market={marketWithCategoryIds}
      categories={categories}
    />
  );
}
