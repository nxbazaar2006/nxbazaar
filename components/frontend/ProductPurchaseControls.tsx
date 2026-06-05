"use client";

import { formatINR } from "@/lib/currency";
import { addToCart } from "@/redux/slices/cartSlice";
import { BadgeIndianRupee, Store, ShoppingBag, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";

type ProductVariant = {
  id: string;
  price: number;
  salePrice?: number | null;
  image?: string | null;
  isDefault?: boolean;
};

type Product = {
  id: string;
  title: string;
  salePrice: number;
  productPrice: number;
  imageUrl?: string | null;
  userId?: string;
  isWholesale?: boolean;
  wholesalePrice?: number | null;
  wholesaleQty?: number | null;
  images?: { url: string; isPrimary?: boolean }[];
  variants?: ProductVariant[];
};

type Props = {
  product: Product;
};

export default function ProductPurchaseControls({ product }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [mode, setMode] = useState<"retail" | "wholesale">("retail");

  const defaultVariant = useMemo(
    () =>
      product.variants?.find((variant) => variant.isDefault) ??
      product.variants?.[0],
    [product.variants]
  );

  const retailPrice = Number(
    defaultVariant?.salePrice ?? defaultVariant?.price ?? product.salePrice ?? 0
  );
  const wholesalePrice = Number(
    product.wholesalePrice ?? retailPrice
  );
  const wholesaleQty = Number(product.wholesaleQty ?? 1);
  const hasWholesale = Boolean(product.isWholesale);
  const activePrice = mode === "wholesale" ? wholesalePrice : retailPrice;
  const activeQty = mode === "wholesale" ? Math.max(1, wholesaleQty) : 1;
  const retailDiscount =
    product.productPrice > 0
      ? Math.round(
          ((product.productPrice - retailPrice) / product.productPrice) * 100
        )
      : 0;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        productVariantId: defaultVariant?.id,
        title: product.title,
        salePrice: activePrice,
        imageUrl:
          defaultVariant?.image ??
          product.imageUrl ??
          product.images?.find((image) => image.isPrimary)?.url ??
          product.images?.[0]?.url ??
          "",
        vendorId: product.userId,
        qty: activeQty,
      })
    );

    toast.success(
      mode === "wholesale"
        ? "Wholesale item added successfully"
        : "Retail item added successfully"
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 rounded-full bg-slate-950 p-1 text-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setMode("retail")}
          className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
            mode === "retail"
              ? "bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 text-white shadow-md shadow-fuchsia-500/20"
              : "text-white/80 hover:bg-slate-800"
          }`}
        >
          <BadgeIndianRupee className="h-4 w-4" />
          Retail
        </button>

        <button
          type="button"
          onClick={() => setMode("wholesale")}
          disabled={!hasWholesale}
          className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            mode === "wholesale"
              ? "bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 text-white shadow-md shadow-fuchsia-500/20"
              : "text-white/80 hover:bg-slate-800"
          }`}
        >
          <Store className="h-4 w-4" />
          Wholesale
        </button>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {mode === "wholesale" ? "Wholesale price" : "Retail price"}
          </p>
          <p className="text-3xl font-bold text-slate-950 dark:text-white">
            {formatINR(activePrice)}
          </p>
          {mode === "wholesale" ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Minimum {activeQty} qty
            </p>
          ) : (
            <del className="text-sm text-slate-400">
              {formatINR(product.productPrice)}
            </del>
          )}
        </div>

        {mode === "retail" && retailDiscount > 0 ? (
          <p className="flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
            <Tag className="me-2 h-4 w-4" />
            Save {retailDiscount}%
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="mx-auto inline-flex h-10 min-w-40 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/20 transition hover:from-orange-400 hover:via-fuchsia-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 active:scale-[0.98] dark:shadow-sky-950/40 dark:focus:ring-sky-400 dark:focus:ring-offset-slate-950"
      >
        <ShoppingBag className="h-4 w-4" />
        Add to Cart
      </button>
    </div>
  );
}
