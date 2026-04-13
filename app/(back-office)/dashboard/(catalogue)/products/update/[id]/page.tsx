import FormHeader from "@/components/backoffice/FormHeader";
import NewProductForm from "@/components/backoffice/NewProductForm";
import { getProduct } from "@/actions/products";
import { getCategories } from "@/actions/category";
import { getSubCategories } from "@/actions/subcategory";
import React from "react";

/*
  Enterprise schema compatible
  ----------------------------
  Product now includes:
  - images
  - variants
  - translations
  - category
  - subCategory
*/

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UpdateProduct({
  params,
}: Params) {
  const { id } = await params;

  /* ================= FETCH DATA ================= */

  const [product, categories, subCategories] =
    await Promise.all([
      getProduct(id),
      getCategories(),
      getSubCategories(),
    ]);

  /* ================= NOT FOUND ================= */

  if (!product) {
    return (
      <div className="p-6 text-red-500">
        Product not found
      </div>
    );
  }

  /* ================= PAGE ================= */

  return (
    <div className="space-y-6">
      <FormHeader title="Update Product" />

      <NewProductForm
        updateData={product}
        categories={categories}
        subCategories={subCategories}
      />
    </div>
  );
}