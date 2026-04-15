"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import type { SubCategory } from "@/types/subcategory";

export const columns: ColumnDef<SubCategory>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "categoryTitle",
    header: "Category",
  },
  {
    accessorKey: "hsnCode.code",
    header: "HSN",
    cell: ({ row }) => row.original.hsnCode?.code ?? "-",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (row.original.isActive ? "Active" : "Inactive"),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
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
