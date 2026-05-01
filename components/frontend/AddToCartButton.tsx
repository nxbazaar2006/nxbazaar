"use client";

import { addToCart } from "@/redux/slices/cartSlice";
import { BaggageClaim } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";

/* ================= TYPES ================= */

type Product = {
  id: string;
  title: string;
  userId?: string;
  salePrice?: number;
  price?: number;
  imageUrl?: string;
  images?: { url: string; isPrimary?: boolean }[];
  variants?: {
    id: string;
    price: number;
    salePrice?: number | null;
    image?: string | null;
    isDefault?: boolean;
  }[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

/* ================= COMPONENT ================= */

export default function AddToCartButton({ product }: { product: Product }) {
  const dispatch = useDispatch<AppDispatch>();

  function handleAddToCart() {
    if (!product) return;

    const variant =
      product.variants?.find((item) => item.isDefault) ??
      product.variants?.[0];
    const primaryImage =
      product.images?.find((image) => image.isPrimary)?.url ??
      product.images?.[0]?.url;

    const cartItem = {
      id: product.id,
      productVariantId: variant?.id,
      title: product.title,
      salePrice: Number(
        variant?.salePrice ?? variant?.price ?? product.salePrice ?? product.price ?? 0
      ),
      imageUrl: variant?.image ?? product.imageUrl ?? primaryImage ?? "",
      vendorId: product.userId,
    };

    dispatch(addToCart(cartItem));
    toast.success("Item added successfully");
  }

  return (
    <button
      onClick={handleAddToCart}
      className="flex items-center gap-2 bg-lime-600 hover:bg-lime-700 transition px-4 py-2 rounded-md text-white text-sm font-medium"
    >
      <BaggageClaim size={18} />
      <span>Add to Cart</span>
    </button>
  );
}
