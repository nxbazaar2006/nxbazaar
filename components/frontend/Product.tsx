"use client";

import { addToCart } from "@/redux/slices/cartSlice";
import { BaggageClaim } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  userId?: string;
}

interface ProductProps {
  product: ProductType;
}

export default function Product({ product }: ProductProps) {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang");
  const pathLocale = pathname.split("/")[1];
  const localePrefix = ["hi", "mr"].includes(pathLocale)
    ? `/${pathLocale}`
    : "";
  const productHref = `${localePrefix}/products/${product.slug}${
    lang ? `?lang=${lang}` : ""
  }`;

  function handleAddToCart() {
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        salePrice: Number(product.salePrice), // ✅ safe
        imageUrl: product.imageUrl,
        vendorId: product.userId,
      })
    );

    toast.success("Item added Successfully");
  }

  return (
    <div className="apple-glass-soft mr-3 overflow-hidden p-0 text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={productHref}>
        <Image
          src={product.imageUrl}
          alt={product.title}
          width={556}
          height={556}
          className="h-48 w-full object-cover"
        />
      </Link>

      <div className="px-4 pb-4 pt-3">
        <Link href={productHref}>
          <h2 className="my-2 line-clamp-2 text-center font-semibold text-foreground">
            {product.title}
          </h2>
        </Link>

        <div className="flex items-center justify-between gap-2 pb-3 text-foreground">
          <p className="font-semibold">UGX {product.salePrice}</p>

          <button
            onClick={handleAddToCart}
            className="flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-fuchsia-500/20 transition hover:from-orange-400 hover:via-fuchsia-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 active:scale-[0.98] dark:shadow-sky-950/40 dark:focus:ring-sky-400 dark:focus:ring-offset-slate-950"
          >
            <BaggageClaim className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
