"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

export default function CartCount() {
  const cartItems = useAppSelector((state) => state.cart || []);
  const count = cartItems.length;

  return (
    <Link
      href="/cart"
      aria-label={`Cart items: ${count}`}
      className="
        group relative inline-flex h-11 w-11 items-center justify-center
        apple-glass-control
        transition-all duration-300
        hover:scale-105 hover:bg-gradient-to-br
        hover:from-pink-500/20 hover:via-purple-500/20 hover:to-orange-500/20
        hover:shadow-lg
      "
    >
      <ShoppingCart className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:scale-110" />

      <span
        className={`
          absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center
          rounded-full px-1.5 text-[11px] font-bold text-white shadow-md
          transition-all duration-300
          ${
            count > 0
              ? "scale-100 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
              : "scale-75 bg-gray-400"
          }
        `}
      >
        {count}
      </span>
    </Link>
  );
}
