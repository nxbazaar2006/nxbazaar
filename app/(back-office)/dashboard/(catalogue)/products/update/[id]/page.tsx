import { notFound } from "next/navigation";
import NewProductForm from "@/components/backoffice/NewProductForm";
import { getProductById } from "@/actions/product";
import { getCategories } from "@/actions/category";
import { getSubCategories } from "@/actions/subcategory";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UpdateProductPage({ params }: Props) {
  const { id } = await params; // ✅ important fix

  if (!id) return notFound();

  const [productRes, categoriesData, subCategoriesData] =
    await Promise.all([
      getProductById(id),
      getCategories(),
      getSubCategories(),
    ]);

  if (!productRes?.success || !productRes?.data) {
    return notFound();
  }

  const product = productRes.data;

  const categories =
    categoriesData?.map((cat) => ({
      id: cat.id,
      title: cat.translations?.[0]?.title || cat.slug,
    })) ?? [];

  const subCategories =
    subCategoriesData?.map((sub) => ({
      id: sub.id,
      title: sub.translations?.[0]?.title || sub.slug,
      categoryId: sub.categoryId,
      hsnCode: sub.hsnCode
        ? {
            id: sub.hsnCode.id,
            code: sub.hsnCode.code,
            title: sub.hsnCode.title,
            gstRate: sub.hsnCode.gstRate,
          }
        : null,
    })) ?? [];

  const updateData = {
    ...product,
    hsnCode: product.hsnCode
      ? {
          id: product.hsnCode.id,
          code: product.hsnCode.code,
          title: product.hsnCode.title,
          gstRate: product.hsnCode.gstRate,
        }
      : null,
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Update Product</h1>

      <NewProductForm
        userId={product.userId}
        categories={categories}
        subCategories={subCategories}
        updateData={updateData}
      />
    </div>
  );
}