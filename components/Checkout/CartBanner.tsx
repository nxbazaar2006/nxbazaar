"use client";

import { ShoppingBag } from "lucide-react";

export default function CartBanner() {
  return (
    <div className="mb-6 flex items-center gap-3 border-b pb-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-lime-100 text-lime-700">
        <ShoppingBag className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          Checkout
        </h1>
        <p className="text-sm text-slate-500">
          Confirm your address and payment method.
        </p>
      </div>
    </div>
  );
}
