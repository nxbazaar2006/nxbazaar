import PageHeader from "@/components/backoffice/PageHeader";
import SubCategoriesClient from "./SubCategoriesClient";
import { getSubCategories } from "@/actions/subcategory";

export default async function SubCategoryPage() {
  const subCategories = await getSubCategories();

  return (
    <div className="space-y-4">
      <PageHeader
        heading="SubCategories"
        href="/dashboard/subcategories/new"
        linkTitle="Add SubCategory"
      />

      <SubCategoriesClient initialData={subCategories} />
    </div>
  );
}
