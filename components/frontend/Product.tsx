"use client";

import { addToCart } from "@/redux/slices/cartSlice";
import { BaggageClaim } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";

interface ProductType {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  salePrice: number;
}

interface ProductProps {
  product: ProductType;
}

export default function Product({ product }: ProductProps) {
  const dispatch = useDispatch<AppDispatch>();

  function handleAddToCart() {
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        salePrice: Number(product.salePrice), // ✅ safe
        imageUrl: product.imageUrl,
        vendorId: "", // ✅ अगर है तो डालो, नहीं तो empty
      })
    );

    toast.success("Item added Successfully");
  }

  return (
    <div className="rounded-lg mr-3 bg-white dark:bg-slate-900 overflow-hidden border shadow">
      <Link href={`/products/${product.slug}`}>
        <Image
          src={product.imageUrl}
          alt={product.title}
          width={556}
          height={556}
          className="w-full h-48 object-cover border-4 border-white"
        />
      </Link>

      <div className="px-4">
        <Link href={`/products/${product.slug}`}>
          <h2 className="text-center dark:text-slate-200 text-slate-800 my-2 font-semibold">
            {product.title}
          </h2>
        </Link>

        <div className="flex items-center justify-between gap-2 pb-3 dark:text-slate-200 text-slate-800">
          <p>UGX {product.salePrice}</p>

          <button
            onClick={handleAddToCart}
            className="flex items-center space-x-2 rounded-md border border-white/40 bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 px-4 py-2 text-white shadow-lg shadow-emerald-500/25 backdrop-blur-md transition hover:from-lime-400 hover:via-emerald-400 hover:to-teal-400 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
          >
            <BaggageClaim />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
