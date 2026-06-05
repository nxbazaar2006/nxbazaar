import Hero from "@/components/frontend/Hero";
import HomeCategoryFilter from "@/components/frontend/HomeCategoryFilter";
import MarketList from "@/components/frontend/MarketList";

import { getCategories } from "@/actions/category";
import { auth } from "@/auth";

interface Product {
  id: string;
}

interface Category {
  id: string;
  title: string;
  products: Product[];
}

type HomeProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

function normalizeLocale(locale?: string) {
  return ["hi", "mr"].includes(locale ?? "") ? locale!.toUpperCase() : "EN";
}

export default async function Home({
  searchParams,
}: HomeProps) {
  const { lang } = (await searchParams) ?? {};
  const locale = normalizeLocale(lang);
  const [categoriesData, session] = await Promise.all([
    getCategories(undefined, locale),
    auth(),
  ]);

  // ✅ Normalize data (handles object / array दोनों cases)
  const categoriesArray: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.data || categoriesData?.categories || [];

  // ✅ Filter safely
  const categories = categoriesArray.filter(
    (category) => (category.products?.length ?? 0) > 0
  );

  console.log("SESSION:", session?.user);

  return (
    <div className="min-h-screen bg-transparent">
      <Hero />

      <MarketList />

      <HomeCategoryFilter categories={categories} lang={lang} />
    </div>
  );
}
