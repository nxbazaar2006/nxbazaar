<<<<<<< HEAD
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
=======
import { db } from "@/lib/db";
import { columns } from "./columns";
import DataTable from "@/components/DataTableComponents/DataTable";

export default async function Page() {
  const subCategories = await db.subCategory.findMany({
    include: { translations: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4">
      <DataTable columns={columns} data={subCategories} />
>>>>>>> cfe7124 (update)
    </div>
  );
}
