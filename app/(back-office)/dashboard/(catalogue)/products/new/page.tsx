import FormHeader from "@/components/backoffice/FormHeader";
import NewProductForm from "@/components/backoffice/NewProductForm";
import { getCategories } from "@/actions/category";
import { getSubCategories } from "@/actions/subcategory";

/* ================= TYPES ================= */

type SelectOption = {
  id: string;
  title: string;
};

type SubCategoryOption = {
  id: string;
  title: string;
  categoryId: string;
  hsnCode: {
    id: string;
    code: string;
    title: string;
    gstRate: number;
  } | null;
};

/* ================= PAGE ================= */

export default async function NewProduct() {
  const categoriesData = await getCategories();
  const subCategoriesData = await getSubCategories();

  /* ================= MAP DATA ================= */

  const categories: SelectOption[] = categoriesData.map((cat) => ({
    id: cat.id,
    title: cat.title,
  }));

  const subCategories: SubCategoryOption[] = subCategoriesData.map((sub) => ({
    id: sub.id,
    title: sub.title,
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

  /* ================= UI ================= */

  return (
    <div>
      <FormHeader title="New Product" />

      <NewProductForm
        categories={categories}
        subCategories={subCategories}
      />
    </div>
  );
}
