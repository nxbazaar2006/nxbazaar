import React from "react";
import Product from "../Product";
import Paginate from "./Paginate";

type ProductType = {
  id: string;
  userId?: string;
  title: string;
  slug: string;
  salePrice: number;
  imageUrl: string;
};

type FilteredProductsProps = {
  products: ProductType[];
  productCount: number;
  isSearch?: boolean;
  pageSize?: number;
};

export default function FilteredProducts({
  products,
  productCount,
  isSearch = false,
  pageSize = 12,
}: FilteredProductsProps) {
  const totalPages = Math.ceil(productCount / pageSize);

  return (
    <div className="space-y-8">
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Product product={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          No products found.
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex w-full items-center justify-center">
          <Paginate totalPages={totalPages} isSearch={isSearch} />
        </div>
      )}
    </div>
  );
}