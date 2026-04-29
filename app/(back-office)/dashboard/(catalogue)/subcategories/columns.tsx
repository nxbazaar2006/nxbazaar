"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";

export type SubCategory = {
  id: string;
  slug: string;
  isActive: boolean;
  category: { title: string };
  hsnCode?: { code: string };
  translations: { title: string }[];
  createdAt: string;
};

export const columns: ColumnDef<SubCategory>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
  },
  {
    accessorFn: (row) => row.translations?.[0]?.title,
    header: "SubCategory Title",
  },
  {
    accessorFn: (row) => row.category?.title,
    header: "Category",
  },
  {
    accessorFn: (row) => row.hsnCode?.code,
    header: "HSN",
  },
  {
    accessorKey: "isActive",
    header: "Active",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn
        row={row}
        title="SubCategory"
        editEndpoint={`subcategories/update/${row.original.id}`}
        endpoint={`subcategories/${row.original.id}`}
      />
    ),
  },
];
