"use client";

import { addToCart } from "@/redux/slices/cartSlice";
import { BaggageClaim } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";

type ProductImage = {
  url: string;
  isPrimary?: boolean;
};

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
  userId?: string;
  salePrice?: number | null;
  price?: number | null;
  imageUrl?: string | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
};

export default function AddToCartButton({ product }: { product: Product }) {
  const dispatch = useDispatch<AppDispatch>();

  const handleAddToCart = () => {
    const variant =
      product.variants?.find((item) => item.isDefault) ??
      product.variants?.[0];

    const primaryImage =
      product.images?.find((image) => image.isPrimary)?.url ??
      product.images?.[0]?.url;

    const cartItem = {
      id: product.id,
      productVariantId: variant?.id ?? undefined,
      title: product.title,
      salePrice: Number(
        variant?.salePrice ??
          variant?.price ??
          product.salePrice ??
          product.price ??
          0
      ),
      imageUrl: variant?.image ?? product.imageUrl ?? primaryImage ?? "",
      vendorId: product.userId ?? undefined,
    };

    dispatch(addToCart(cartItem));
    toast.success("Item added to cart");
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-fuchsia-500/20 transition hover:from-orange-400 hover:via-fuchsia-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 active:scale-[0.98] dark:shadow-sky-950/40 dark:focus:ring-sky-400 dark:focus:ring-offset-slate-950"
    >
      <BaggageClaim className="h-4 w-4" />
      <span>Add to Cart</span>
    </button>
  );
}
