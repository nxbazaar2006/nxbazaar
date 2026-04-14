import SubCategoryForm from "@/components/backoffice/Forms/SubCategoryForm";
import { getCategories } from "@/actions/category";
import { getSubCategoryById } from "@/actions/subcategory";
import { getHsnCodes } from "@/actions/hsnCode";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UpdateSubCategoryPage({ params }: PageProps) {
  const { id } = await params;

  const [categories, subCategory, hsnCodes] = await Promise.all([
    getCategories(),
    getSubCategoryById(id),
    getHsnCodes(),
  ]);

  return (
    <SubCategoryForm
      categories={categories}
      hsnCodes={hsnCodes}
      updateData={subCategory}
    />
  );
}
