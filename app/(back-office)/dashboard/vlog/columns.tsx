"use client";

import { ColumnDef } from "@tanstack/react-table";
import { VlogType } from "@/types/vlog.types";
import { Checkbox } from "@/components/ui/checkbox";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import Link from "next/link";

export const columns: ColumnDef<VlogType>[] = [
  /* SELECT */
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) =>
          table.toggleAllPageRowsSelected(!!v)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) =>
          row.toggleSelected(!!v)
        }
      />
    ),
  },

  /* TITLE */
  {
    accessorKey: "translations",
    header: ({ column }) => (
      <SortableColumn column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const vlog = row.original;
      return vlog.translations?.[0]?.title ?? "—";
    },
  },

  /* SLUG */
  {
    accessorKey: "title",
    header: "Title (Base)",
  },

  /* DATE */
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <DateColumn<VlogType>
        row={row}
        accessorKey="createdAt"
      />
    ),
  },

  /* ACTIONS */
  {
    id: "actions",
    cell: ({ row }) => {
      const vlog = row.original;

      return (
        <div className="flex gap-2">
          <Link href={`/dashboard/vlog/update/${vlog.id}`}>
            Edit
          </Link>

          <ActionColumn
            row={row}
            title="Vlog"
            editEndpoint={`vlog/update/${vlog.id}`}
            endpoint={`vlogs/${vlog.id}`}
          />
        </div>
      );
    },
  },
];
