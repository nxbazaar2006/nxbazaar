import CategoryList from "@/components/frontend/CategoryList";
import Hero from "@/components/frontend/Hero";
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

export default async function Home(): Promise<JSX.Element> {
  const [categoriesData, session] = await Promise.all([
    getCategories(),
    auth(),
  ]);

  // ✅ Normalize data (handles object / array दोनों cases)
  const categoriesArray: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.data || categoriesData?.categories || [];

  // ✅ Filter safely
  const categories = categoriesArray.filter(
    (category) => (category.products?.length ?? 0) > 3
  );

  console.log("SESSION:", session?.user);

  return (
    <div className="min-h-screen">
      <Hero />

      <MarketList />

      {categories.map((category) => (
        <div className="py-8" key={category.id}>
          <CategoryList
            isMarketPage={false}
            category={category}
          />
        </div>
      ))}
    </div>
  );
}