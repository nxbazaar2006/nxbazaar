"use client";

import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";
import type { SubCategory } from "@/types/subcategory";
import { useSubCategories } from "@/hooks/useSubCategory";

interface SubCategoriesClientProps {
  initialData: SubCategory[];
}

export default function SubCategoriesClient({ initialData }: SubCategoriesClientProps) {
  const { data } = useSubCategories(initialData);

  return (
    <DataTable<SubCategory>
      data={data ?? []}
      columns={columns}
      endpoint="subcategories"
      queryKey={["subcategories"]}
    />
  );
}
