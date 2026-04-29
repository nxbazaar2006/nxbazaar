'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import SortableColumn from '@/components/DataTableColumns/SortableColumn';
import Status from '@/components/DataTableColumns/Status';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

/* ================= HELPER ================= */

function getDefaultVariant(product: Product) {
  if (!product.variants || product.variants.length === 0) return null;

  return (
    product.variants.find((v) => v.isDefault) ||
    product.variants[0]
  );
}

/* ================= COLUMNS ================= */

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
      />
    ),

    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) =>
          row.toggleSelected(!!value)
        }
      />
    ),

    enableSorting: false,
    size: 50,
  },

  /* ================= TITLE ================= */
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <SortableColumn column={column} title="Product Title" />
    ),
  },

  /* ================= CATEGORY ================= */
  {
    id: 'category',
    header: 'Category',
    cell: ({ row }) =>
      row.original.category?.slug ?? '-',
  },

  /* ================= SKU ================= */
  {
    id: 'sku',
    header: ({ column }) => (
      <SortableColumn column={column} title="SKU" />
    ),

    sortingFn: (a, b) => {
      const v1 = getDefaultVariant(a.original)?.sku ?? '';
      const v2 = getDefaultVariant(b.original)?.sku ?? '';
      return v1.localeCompare(v2);
    },

    cell: ({ row }) => {
      const v = getDefaultVariant(row.original);
      return v?.sku ?? '-';
    },
  },

  /* ================= PRICE ================= */
  {
    id: 'price',
    header: ({ column }) => (
      <SortableColumn column={column} title="Price" />
    ),

    sortingFn: (a, b) => {
      const v1 = getDefaultVariant(a.original)?.price ?? 0;
      const v2 = getDefaultVariant(b.original)?.price ?? 0;
      return v1 - v2;
    },

    cell: ({ row }) => {
      const v = getDefaultVariant(row.original);
      if (!v) return '-';

      return v.salePrice ? (
        <div className="flex flex-col">
          <span className="line-through text-xs text-gray-400">
            ₹{v.price.toFixed(2)}
          </span>
          <span className="text-green-600 font-semibold">
            ₹{v.salePrice.toFixed(2)}
          </span>
        </div>
      ) : (
        `₹${v.price.toFixed(2)}`
      );
    },
  },

  /* ================= STOCK ================= */
  {
    id: 'stock',
    header: ({ column }) => (
      <SortableColumn column={column} title="Stock" />
    ),

    sortingFn: (a, b) => {
      const v1 = getDefaultVariant(a.original)?.stock ?? 0;
      const v2 = getDefaultVariant(b.original)?.stock ?? 0;
      return v1 - v2;
    },

    cell: ({ row }) => {
      const v = getDefaultVariant(row.original);

      if (!v) return 0;

      return (
        <span
          className={
            v.stock < 5
              ? 'text-red-500 font-semibold'
              : ''
          }
        >
          {v.stock}
        </span>
      );
    },
  },

  /* ================= STATUS ================= */
  {
    accessorKey: 'isActive',
    header: 'Status',

    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;

      return (
        <Status status={isActive ? 'active' : 'inactive'} />
      );
    },
  },

  /* ================= ACTIONS ================= */
  {
    id: 'actions',
    header: 'Actions',

    cell: ({ row }) => {
      const product = row.original;

      const handleDelete = async () => {
        const confirmDelete = confirm(
          'Delete this product?'
        );
        if (!confirmDelete) return;

        try {
          const res = await fetch(
            `/api/products/${product.id}`,
            { method: 'DELETE' }
          );

          if (!res.ok) throw new Error();

          toast.success('Product deleted');

          // 🔥 better than reload (optional)
          window.location.reload();
        } catch {
          toast.error('Delete failed');
        }
      };

      return (
        <div className="flex gap-2">
          {/* EDIT */}
          <Link
            href={`/dashboard/products/update/${product.id}`}
          >
            <Button size="icon" variant="outline">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>

          {/* DELETE */}
          <Button
            size="icon"
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },

    enableSorting: false,
    size: 120,
  },
];
