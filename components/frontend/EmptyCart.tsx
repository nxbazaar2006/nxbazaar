import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="flex min-h-[450px] items-center justify-center">
      <div
        className="
          max-w-md text-center
          rounded-3xl border border-white/10
          bg-white/10 p-8
          shadow-sm backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto mb-5 flex h-20 w-20 items-center justify-center
            rounded-full
            bg-gradient-to-br
            from-orange-500/20
            via-pink-500/20
            to-purple-500/20
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
            inline-flex items-center justify-center
            rounded-2xl px-6 py-3
            font-semibold text-white
            bg-gradient-to-r
            from-orange-500
            via-pink-500
            to-purple-500
            shadow-md
            transition-all duration-300
            hover:scale-105 hover:shadow-xl
          "
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}