"use client";

import {
  decrementQty,
  incrementQty,
  removeFromCart,
} from "@/redux/slices/cartSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

type CartItem = {
  id: string;
  title: string;
  salePrice: number;
  imageUrl?: string;
  qty: number;
};

export default function CartProduct({ cartItem }: { cartItem: CartItem }) {
  const dispatch = useAppDispatch();

  const price = Number(cartItem.salePrice || 0);
  const qty = Number(cartItem.qty || 0);
  const total = price * qty;

  function handleCartItemDelete(cartId: string) {
    dispatch(removeFromCart(cartId));
    toast.success("Item removed successfully");
  }

  function handleQtyIncrement(cartId: string) {
    dispatch(incrementQty(cartId));
  }

  function handleQtyDecrement(cartId: string) {
    if (qty <= 1) return;
    dispatch(decrementQty(cartId));
  }

  return (
    <div
      className="
        neumorphic-card grid grid-cols-1 gap-4 rounded-3xl
        p-4
        md:grid-cols-12 md:items-center
      "
    >
      <div className="flex items-center gap-4 md:col-span-6">
        {cartItem.imageUrl ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-muted">
            <Image
              src={cartItem.imageUrl}
              fill
              sizes="80px"
              alt={cartItem.title}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-muted text-xs text-muted-foreground">
            No Image
          </div>
        )}

        <div>
          <h2 className="line-clamp-2 text-sm font-semibold">
            {cartItem.title}
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            ₹{price.toFixed(2)} each
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:col-span-3 md:justify-center">
        <span className="text-xs font-medium text-muted-foreground md:hidden">
          Quantity
        </span>

        <div className="raised-panel flex items-center overflow-hidden rounded-2xl">
          <button
            type="button"
            onClick={() => handleQtyDecrement(cartItem.id)}
            disabled={qty <= 1}
            className="flex h-9 w-9 items-center justify-center transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={14} />
          </button>

          <span className="min-w-10 text-center text-sm font-semibold">
            {qty}
          </span>

          <button
            type="button"
            onClick={() => handleQtyIncrement(cartItem.id)}
            className="flex h-9 w-9 items-center justify-center transition hover:bg-white/20"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between md:col-span-3 md:justify-end">
        <div className="text-left md:text-right">
          <h4 className="text-sm font-bold text-green-600">
            ₹{total.toFixed(2)}
          </h4>

          <p className="text-xs text-muted-foreground">
            ₹{price.toFixed(2)} × {qty}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleCartItemDelete(cartItem.id)}
          className="
            soft-button soft-icon-btn ml-4 h-9 w-9
            text-red-500 transition-all duration-300
            hover:scale-110 hover:bg-red-500/10
          "
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
