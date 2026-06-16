"use client";

import { ShoppingBag } from "lucide-react";

export default function CartBanner() {
  return (
    <div className="neumorphic-card mb-6 flex items-center gap-3 p-4">
      <div className="soft-button soft-icon-btn text-lime-600 dark:text-lime-300">
        <ShoppingBag className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-foreground text-lg font-semibold">
          Checkout
        </h1>
        <p className="text-sm text-slate-500">
          Confirm your address and payment method.
        </p>
      </div>
    </div>
  );
}
