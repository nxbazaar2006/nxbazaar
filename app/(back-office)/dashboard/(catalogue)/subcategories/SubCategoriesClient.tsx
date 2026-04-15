"use client";

import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";
import type { SubCategory } from "@/types/subcategory";
import { useSubCategories } from "@/hooks/useSubCategory";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getCurrentLocale } from "@/lib/i18n";

interface SubCategoriesClientProps {
  initialData: SubCategory[];
}

<<<<<<< HEAD
export default function SubCategoriesClient({ initialData }: SubCategoriesClientProps) {
  const { data } = useSubCategories(initialData);
=======
export default function SubCategoriesClient({
  initialData,
}: SubCategoriesClientProps) {
  const pathname = usePathname();

  const locale = getCurrentLocale(pathname) || "en";

  const { data, isLoading } = useSubCategories(initialData, locale);

  const tableData = useMemo(() => {
    return data ?? initialData;
  }, [data, initialData]);
>>>>>>> cfe7124 (update)

  return (
    <DataTable<SubCategory>
      data={tableData}
      columns={columns}
<<<<<<< HEAD
      endpoint="subcategories"
      queryKey={["subcategories"]}
=======
      endpoint={`subcategories?locale=${locale}`}
      queryKey={["subcategories", locale]}
      isLoading={isLoading}
>>>>>>> cfe7124 (update)
    />
  );
}
