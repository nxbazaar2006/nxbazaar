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
      className="soft-button inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
    >
      <BaggageClaim className="h-4 w-4" />
      <span>Add to Cart</span>
    </button>
  );
}
