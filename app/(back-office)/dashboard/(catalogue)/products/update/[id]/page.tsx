import { notFound } from "next/navigation";
import NewProductForm from "@/components/backoffice/NewProductForm";
import ProductHistoryTimeline from "@/components/backoffice/ProductHistoryTimeline";
import { getProductById, getProductHistory } from "@/actions/product";
import { getCategories } from "@/actions/category";
import { getSubCategories } from "@/actions/subcategory";
import { db } from "@/lib/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type SubCategoryOption = {
  id: string;
  categoryId: string;
  slug: string;
  translations?: { title: string }[];
  hsnCode?: {
    id: string;
    code: string;
    title: string;
    gstRate: number;
  } | null;
};

type ProductFormUpdateData = Parameters<typeof NewProductForm>[0]["updateData"];

export default async function UpdateProductPage({ params }: Props) {
  const { id } = await params; // ✅ important fix

  if (!id) return notFound();

  const [productRes, categoriesData, subCategoriesData, historyRes] =
    await Promise.all([
      getProductById(id),
      getCategories(),
      getSubCategories(),
      getProductHistory(id),
    ]);

  if (!productRes?.success || !productRes?.data) {
    return notFound();
  }

  const product = productRes.data;
  const owner = await db.user.findUnique({
    where: { id: product.userId },
    select: {
      id: true,
      sellerProfile: {
        select: {
          code: true,
        },
      },
    },
  });

  const categoriesSource = Array.isArray(categoriesData) ? categoriesData : [];
  const categories =
    categoriesSource.map((cat) => ({
      id: cat.id,
      title: cat.translations?.[0]?.title || cat.slug,
    }));

  const subCategoryList =
    subCategoriesData?.success && Array.isArray(subCategoriesData.data)
      ? (subCategoriesData.data as SubCategoryOption[])
      : [];

  const subCategories =
    subCategoryList.map((sub) => ({
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
    }));

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
        vendorCode={owner?.sellerProfile?.code}
        categories={categories}
        subCategories={subCategories}
        updateData={updateData as ProductFormUpdateData}
      />

      <ProductHistoryTimeline
        history={historyRes.success ? historyRes.data : []}
      />
    </div>
  );
}
