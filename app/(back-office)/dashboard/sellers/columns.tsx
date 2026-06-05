"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import DateColumn from "@/components/DataTableColumns/DateColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";

// ✅ Define Seller Type
export type Seller = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  plan: string | null;
  status: boolean;
  createdAt: string | Date;
  sellerProfile?: {
    contactPerson: string | null;
    phone: string | null;
    mainProduct: string | null;
  } | null;
};

// ✅ Typed Columns
export const columns: ColumnDef<Seller>[] = [
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
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableColumn column={column} title="Name" />
    ),
  },

  {
    accessorKey: "email",
    header: "Email",
  },

  {
    accessorKey: "role",
    header: "Role",
  },

  {
    accessorKey: "sellerProfile.mainProduct",
    header: "Main Product",
    cell: ({ row }) => row.original.sellerProfile?.mainProduct ?? "-",
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.status ? "Active" : "Inactive"}
      </span>
    ),
  },

  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => (
      <DateColumn row={row} accessorKey="createdAt" />
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const seller = row.original;

      return (
        <ActionColumn
          row={row}
          title="Seller"
          editEndpoint={`sellers/update/${seller.id}`}
          endpoint="sellers"
        />
      );
    },
  },
];
