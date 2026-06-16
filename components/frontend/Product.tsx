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
    <div className="liquid-glass-card skeuo-product-card group mr-3 p-0 transition-all duration-300 hover:-translate-y-1">
      <Link href={productHref} className="liquid-glass-media block overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.title}
          width={556}
          height={556}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="px-4 pb-4 pt-3">
        <Link href={productHref}>
          <h2 className="my-2 line-clamp-2 min-h-11 text-center text-sm font-semibold leading-snug text-foreground">
            {product.title}
          </h2>
        </Link>

        <div className="flex items-center justify-between gap-2 pb-3 text-foreground">
          <p className="text-sm font-semibold tracking-tight">UGX {product.salePrice}</p>

          <button
            onClick={handleAddToCart}
            className="liquid-glass-button soft-button flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          >
            <BaggageClaim className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
