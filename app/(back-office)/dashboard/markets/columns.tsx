// app/dashboard/markets/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Market } from "@/types/market";
import { Checkbox } from "@/components/ui/checkbox";

import DateColumn from "@/components/DataTableColumns/DateColumn";
import ImageColumn from "@/components/DataTableColumns/ImageColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";

export const columns: ColumnDef<Market>[] = [
  /* =====================================================
     SELECT ROW
  ===================================================== */
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value: boolean) =>
          table.toggleAllPageRowsSelected(value)
        }
        aria-label="Select all"
      />
    ),

    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) =>
          row.toggleSelected(value)
        }
        aria-label="Select row"
      />
    ),

    enableSorting: false,
    enableHiding: false,
  },

  /* =====================================================
     TITLE
  ===================================================== */
  {
    accessorKey: "title",

    header: ({ column }) => (
      <SortableColumn
        column={column}
        title="Title"
      />
    ),
  },

  /* =====================================================
     SLUG
  ===================================================== */
  {
    accessorKey: "slug",

    header: ({ column }) => (
      <SortableColumn
        column={column}
        title="Slug"
      />
    ),
  },

  /* =====================================================
     LOGO
  ===================================================== */
  {
    accessorKey: "logoUrl",
    header: "Logo",

    cell: ({ row }) => (
      <ImageColumn<Market>
        row={row}
        accessorKey="logoUrl"
      />
    ),
  },

  /* =====================================================
     STATUS
  ===================================================== */
  {
    accessorKey: "isActive",
    header: "Active",

    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.isActive ? "Yes" : "No"}
      </span>
    ),
  },

  /* =====================================================
     CREATED DATE
  ===================================================== */
  {
    accessorKey: "createdAt",

    header: ({ column }) => (
      <SortableColumn
        column={column}
        title="Created"
      />
    ),

    cell: ({ row }) => (
      <DateColumn<Market>
        row={row}
        accessorKey="createdAt"
      />
    ),
  },

  /* =====================================================
     ACTIONS
  ===================================================== */
  {
    id: "actions",

    cell: ({ row }) => {
      const market = row.original;

      return (
        <ActionColumn<Market>
          row={row}
          title="Market"
          editEndpoint={`/dashboard/markets/update/${market.id}`}
          endpoint={`/api/markets/${market.id}`}
        />
      );
    },

    enableSorting: false,
    enableHiding: false,
  },
];