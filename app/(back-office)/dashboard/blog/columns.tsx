"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BlogType } from "@/types/blog.types";
import { Checkbox } from "@/components/ui/checkbox";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import Link from "next/link";

export const columns: ColumnDef<BlogType>[] = [
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
      const blog = row.original;
      return blog.translations?.[0]?.title ?? "—";
    },
  },

  /* SLUG */
  {
    accessorKey: "slug",
    header: "Slug",
  },

  /* STATUS */
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => {
      const blog = row.original;

      return (
        <span
          className={`px-2 py-1 rounded ${
            blog.isActive
              ? "bg-green-500 text-white"
              : "bg-gray-400 text-white"
          }`}
        >
          {blog.isActive ? "Active" : "Draft"}
        </span>
      );
    },
  },

  /* DATE */
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <DateColumn<BlogType>
        row={row}
        accessorKey="createdAt"
      />
    ),
  },

  /* ACTIONS */
  {
    id: "actions",
    cell: ({ row }) => {
      const blog = row.original;

      return (
        <div className="flex gap-2">
          <Link href={`/dashboard/blog/update/${blog.id}`}>
            Edit
          </Link>

          <ActionColumn
            row={row}
            title="Blogs"
            editEndpoint={`blog/update/${blog.id}`}
            endpoint={`blogs/${blog.id}`}
          />
        </div>
      );
    },
  },
];
