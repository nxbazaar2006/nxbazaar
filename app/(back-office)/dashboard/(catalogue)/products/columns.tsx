'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import SortableColumn from '@/components/DataTableColumns/SortableColumn';
import ActionColumn from '@/components/DataTableColumns/ActionColumn';
import { Product } from '@/types/product';

/* ================= HELPER ================= */

type DisplayRelation = {
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  translations?: {
    title?: string | null;
    slug?: string | null;
  }[];
} | null;

function getDefaultVariant(product: Product) {
  if (!product.variants || product.variants.length === 0) return null;

  return (
    product.variants.find((v) => v.isDefault) ||
    product.variants[0]
  );
}

function getRelationName(relation: DisplayRelation) {
  return (
    relation?.name ??
    relation?.title ??
    relation?.translations?.[0]?.title ??
    relation?.slug ??
    relation?.translations?.[0]?.slug ??
    '-'
  );
}

function shortText(value: string | null | undefined, fallback = '-') {
  const text = value?.trim();

  if (!text) return fallback;

  return (
    <span className="block max-w-[180px] truncate" title={text}>
      {text}
    </span>
  );
}

function formatMoney(value: number | null | undefined, currency = 'INR') {
  if (typeof value !== 'number') return '-';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function getProductImage(product: Product) {
  return (
    product.imageUrl?.trim() ||
    product.images?.find((image) => image.isPrimary)?.url ||
    product.images?.[0]?.url ||
    getDefaultVariant(product)?.image ||
    ""
  );
}

function ProductImageCell({ product }: { product: Product }) {
  const imageUrl = getProductImage(product);

  if (!imageUrl) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-card text-card-foreground shadow-sm text-xs text-muted-foreground">
        -
      </div>
    );
  }

  return (
    <div className="h-11 w-11 overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
      <img
        src={imageUrl}
        alt={product.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
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

  /* ================= IMAGE ================= */
  {
    id: 'image',
    header: 'Image',
    cell: ({ row }) => <ProductImageCell product={row.original} />,
    enableSorting: false,
    size: 70,
  },

  /* ================= TITLE ================= */
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <SortableColumn column={column} title="Product Title" />
    ),
    cell: ({ row }) => shortText(row.original.title),
    size: 220,
  },

  /* ================= PRODUCT CODE ================= */
  {
    accessorKey: 'productCode',
    header: ({ column }) => (
      <SortableColumn column={column} title="Product Code" />
    ),
    cell: ({ row }) => shortText(row.original.productCode, '-'),
    size: 180,
  },

  /* ================= CATEGORY ================= */
  {
    id: 'category',
    header: 'Category',
    cell: ({ row }) =>
      shortText(getRelationName(row.original.category)),
    size: 180,
  },

  /* ================= SUBCATEGORY ================= */
  {
    id: 'subCategory',
    header: 'SubCategory',
    cell: ({ row }) =>
      shortText(getRelationName(row.original.subCategory)),
    size: 180,
  },

  /* ================= HSN ================= */
  {
    id: 'hsnCode',
    header: 'HSN',
    cell: ({ row }) => shortText(row.original.hsnCode?.code),
    size: 110,
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
      return shortText(v?.sku);
    },
    size: 210,
  },

  /* ================= BARCODE ================= */
  {
    id: 'barcode',
    header: 'Barcode',
    cell: ({ row }) => {
      const v = getDefaultVariant(row.original);
      return shortText(v?.barcode);
    },
    size: 180,
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
        <div className="flex min-w-[110px] flex-col">
          <span className="line-through text-xs text-gray-400">
            {formatMoney(v.price, v.currency)}
          </span>
          <span className="text-green-600 font-semibold">
            {formatMoney(v.salePrice, v.currency)}
          </span>
        </div>
      ) : (
        formatMoney(v.price, v.currency)
      );
    },
    size: 130,
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
      const stock = v?.stock ?? 0;

      return (
        <span
          className={
            stock < 5
              ? 'text-red-500 font-semibold'
              : ''
          }
        >
          {stock}
        </span>
      );
    },
    size: 100,
  },

  /* ================= UNIT ================= */
  {
    accessorKey: 'unit',
    header: 'Unit',
    cell: ({ row }) => shortText(row.original.unit),
    size: 100,
  },

  /* ================= CURRENCY ================= */
  {
    accessorKey: 'currency',
    header: 'Currency',
    cell: ({ row }) => row.original.currency ?? '-',
    size: 100,
  },

  /* ================= GST ================= */
  {
    accessorKey: 'gstRate',
    header: 'GST',
    cell: ({ row }) =>
      typeof row.original.gstRate === 'number'
        ? `${row.original.gstRate}%`
        : row.original.hsnCode?.gstRate
          ? `${row.original.hsnCode.gstRate}%`
          : '-',
    size: 100,
  },

  /* ================= VARIANTS ================= */
  {
    id: 'variants',
    header: 'Variants',
    cell: ({ row }) => row.original.variants?.length ?? 0,
    size: 100,
  },

  /* ================= WHOLESALE ================= */
  {
    accessorKey: 'isWholesale',
    header: 'Wholesale',
    cell: ({ row }) => (row.original.isWholesale ? 'Yes' : 'No'),
    size: 120,
  },

  /* ================= ACTIONS ================= */
  {
    id: 'actions',
    header: 'Actions',

    cell: ({ row }) => (
      <ActionColumn
        row={row}
        title="Product"
        editEndpoint={`products/update/${row.original.id}`}
        endpoint="products"
      />
    ),

    enableSorting: false,
    size: 120,
  },
];
