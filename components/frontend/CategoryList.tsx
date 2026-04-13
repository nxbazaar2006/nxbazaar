import Link from "next/link";
import CategoryCarousel from "./CategoryCarousel";

export default function CategoryList({ category, isMarketPage }) {

  if (!category) return null;

  return (
    <div className="bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-700 text-slate-800 overflow-hidden">

      {/* Header */}

      <div className="bg-slate-100 dark:bg-gray-800 py-3 px-6 font-semibold border-b border-gray-300 dark:border-gray-600 text-slate-800 dark:text-slate-100 flex flex-wrap justify-between items-center gap-2">

        <h2 className="text-lg">
          {category.title}
        </h2>

        <Link
          href={`/category/${category.slug}`}
          className="bg-lime-600 hover:bg-lime-700 transition-colors text-white rounded-md px-4 py-2 text-sm"
        >
          See All
        </Link>

      </div>

      {/* Products */}

      <div className="bg-white dark:bg-slate-700 p-4">

        <CategoryCarousel
          isMarketPage={isMarketPage}
          products={category?.products || []}
        />

      </div>

    </div>
  );
}
