

"use client";

import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";
import { SubCategory } from "@/types/subcategory";
import { useSubCategories } from "@/hooks/useSubCategory";

interface SubCategoriesClientProps {
  initialData: SubCategory[];
}

export default function SubCategoriesClient({
  initialData,
}: SubCategoriesClientProps) {
  const { data, isLoading } = useSubCategories(initialData);

  return (
    <DataTable<SubCategory>
      data={data ?? []}
      columns={columns}
      endpoint="subcategories"
      queryKey={["subcategories"]}
      isLoading={isLoading}
    />
  );
}