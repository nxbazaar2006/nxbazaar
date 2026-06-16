import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="flex min-h-[450px] items-center justify-center">
      <div
        className="
          neumorphic-card max-w-md rounded-3xl p-8 text-center
        "
      >
        <div
          className="
            mx-auto mb-5 flex h-20 w-20 items-center justify-center
            rounded-full
            bg-white/70 shadow-inner dark:bg-white/10
          "
        >
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>

        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Your Cart is Empty
        </h2>

       <p className="mb-6 text-sm text-muted-foreground">
  Looks like you haven&apos;t added any products yet.
  Explore our collection and find something amazing.
</p>

        <Link
          href="/"
          className="
            soft-button inline-flex items-center justify-center
            rounded-full px-6 py-3
            font-semibold
          "
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}
