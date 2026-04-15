"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
<<<<<<< HEAD
import type { SubCategory } from "@/types/subcategory";
=======

export type SubCategory = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  category?: {
    id?: string;
    title?: string;
  };
  createdAt: string;
};
>>>>>>> cfe7124 (update)

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

  // ✅ FIXED CATEGORY COLUMN
  {
<<<<<<< HEAD
    accessorKey: "categoryTitle",
=======
    id: "category",
>>>>>>> cfe7124 (update)
    header: "Category",
    cell: ({ row }) => (
      <span>
        {row.original.category?.title || "N/A"}
      </span>
    ),
  },

  {
    accessorKey: "hsnCode.code",
    header: "HSN",
    cell: ({ row }) => row.original.hsnCode?.code ?? "-",
  },
  {
    accessorKey: "isActive",
    header: "Status",
<<<<<<< HEAD
    cell: ({ row }) => (row.original.isActive ? "Active" : "Inactive"),
=======
    cell: ({ row }) => (
      <span
        className={
          row.original.isActive
            ? "text-green-600"
            : "text-red-500"
        }
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
>>>>>>> cfe7124 (update)
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
<<<<<<< HEAD
];
=======
];
>>>>>>> cfe7124 (update)
