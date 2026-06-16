"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import ImageColumn from "@/components/DataTableColumns/ImageColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";

// ✅ Type FIX (translations optional)
export type CategoryColumn = {
  id: string;
  imageUrl?: string | null;
  isActive: boolean;
  translations?: {
    title: string;
    locale?: string;
  }[];
  createdAt: string;
};

// ✅ Columns
export const columns: ColumnDef<CategoryColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) =>
          row.toggleSelected(!!value)
        }
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // ✅ FIXED TITLE COLUMN (SAFE + SMART)
  {
    accessorKey: "translations",
    header: ({ column }) => (
      <SortableColumn column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const translations = row.original.translations;

      // fallback handling
      if (!translations || translations.length === 0) return "—";

      // 👉 optional: specific locale (recommended)
      const preferred =
        translations.find((t) => t.locale === "en") || translations[0];

      return preferred?.title || "—";
    },
  },

  {
    accessorKey: "imageUrl",
    header: "Category Image",
    cell: ({ row }) => (
      <ImageColumn row={row} accessorKey="imageUrl" />
    ),
  },

  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-2xl text-xs ${
          row.original.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableColumn column={column} title="Date Created" />
    ),
    cell: ({ row }) => (
      <DateColumn row={row} accessorKey="createdAt" />
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;

      return (
      <ActionColumn
  row={row}
  title="Category"
  editEndpoint={`/categories/update/${category.id}`} // ✅ full path
  endpoint={`/categories/${category.id}`}
/>
      );
    },
  },
];