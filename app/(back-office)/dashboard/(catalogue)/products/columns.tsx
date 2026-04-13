'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import SortableColumn from '@/components/DataTableColumns/SortableColumn';
import Status from '@/components/DataTableColumns/Status';
import ActionColumn from '@/components/DataTableColumns/ActionColumn';
import { Product } from '@/types/product';

/*
  Enterprise schema compatible columns
  -----------------------------------
  OLD fields removed:
  - sku
  - productPrice
  - salePrice
  - productStock

  NOW values come from variants[]
*/

export const columns: ColumnDef<Product>[] = [
  /* ================= SELECT ================= */
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          table.getIsSomePageRowsSelected()
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
    size: 50,
  },

  /* ================= TITLE ================= */
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <SortableColumn
        column={column}
        title="Product Title"
      />
    ),
  },

  /* ================= CATEGORY ================= */
  {
    id: 'category',
    header: 'Category',
    cell: ({ row }) =>
      row.original.category?.title ?? '-',
  },

  /* ================= DEFAULT SKU ================= */
  {
    id: 'sku',
    header: ({ column }) => (
      <SortableColumn
        column={column}
        title="SKU"
      />
    ),

    cell: ({ row }) => {
      const defaultVariant =
        row.original.variants?.find(
          (variant) => variant.isDefault
        ) ?? row.original.variants?.[0];

      return defaultVariant?.sku ?? '-';
    },
  },

  /* ================= PRICE ================= */
  {
    id: 'price',
    header: ({ column }) => (
      <SortableColumn
        column={column}
        title="Price"
      />
    ),

    cell: ({ row }) => {
      const defaultVariant =
        row.original.variants?.find(
          (variant) => variant.isDefault
        ) ?? row.original.variants?.[0];

      return `₹${defaultVariant?.price?.toFixed(2) ?? '0.00'}`;
    },
  },

  /* ================= SALE PRICE ================= */
  {
    id: 'salePrice',
    header: ({ column }) => (
      <SortableColumn
        column={column}
        title="Sale Price"
      />
    ),

    cell: ({ row }) => {
      const defaultVariant =
        row.original.variants?.find(
          (variant) => variant.isDefault
        ) ?? row.original.variants?.[0];

      return defaultVariant?.salePrice
        ? `₹${defaultVariant.salePrice.toFixed(2)}`
        : '-';
    },
  },

  /* ================= STOCK ================= */
  {
    id: 'stock',
    header: ({ column }) => (
      <SortableColumn
        column={column}
        title="Stock"
      />
    ),

    cell: ({ row }) => {
      const defaultVariant =
        row.original.variants?.find(
          (variant) => variant.isDefault
        ) ?? row.original.variants?.[0];

      return defaultVariant?.stock ?? 0;
    },
  },

  /* ================= STATUS ================= */
  {
    accessorKey: 'isActive',
    header: 'Status',

    cell: ({ row }) => {
      const isActive =
        row.getValue('isActive') as boolean;

      return (
        <Status
          status={isActive ? 'active' : 'inactive'}
        />
      );
    },
  },

  /* ================= ACTIONS ================= */
  {
    id: 'actions',
    header: 'Actions',

    cell: ({ row }) => (
      <ActionColumn
        row={row}
        title="Product"
        endpoint={`products/${row.original.id}`}
        editEndpoint={`products/update/${row.original.id}`}
      />
    ),

    enableSorting: false,
    size: 100,
  },
];