import React from "react";
import Breadcrumb from "./Breadcrumb";
import Sorting from "./Sorting";
import Filters from "./Filters";
import FilteredProducts from "./FilteredProducts";

// ✅ Category Type
type Category = {
  title: string;
  slug: string;
  isSearch?: boolean;
  products: {
    id: string;
  }[];
};

// ✅ Product Type (extend later as needed)
type Product = {
  id: string;
  title: string;
};

// ✅ Props Type
type FilterComponentProps = {
  category: Category;
  products: Product[];
};

export default function FilterComponent({
  category,
  products,
}: FilterComponentProps) {
  const { title, slug, isSearch } = category;

  // ✅ safer count (optional chaining)
  const productCount = category?.products?.length ?? 0;

  return (
    <div>
      {/* 🔹 Top Section */}
      <div className="neumorphic-card space-y-6 px-4 py-8">
        <Breadcrumb title={title} resultCount={productCount} />

        <Sorting isSearch={isSearch} title={title} slug={slug} />
      </div>

      {/* 🔹 Main Layout */}
      <div className="grid grid-cols-1 gap-4 py-8 lg:grid-cols-12">
        {/* Filters */}
        <div className="lg:col-span-3">
          <Filters slug={slug} isSearch={isSearch} />
        </div>

        {/* Products */}
        <div className="lg:col-span-9">
          <FilteredProducts
            isSearch={isSearch}
            productCount={productCount}
            products={products}
          />
        </div>
      </div>
    </div>
  );
}
