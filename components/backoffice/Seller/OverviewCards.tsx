import {
  ChevronRight,
  Package,
  ShoppingCart,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";

type Sale = {
  total: number;
};

type Product = {
  id: string;
};

type OverviewCardsProps = {
  sales: Sale[];
  products: Product[];
};

export default function OverviewCards({
  sales = [],
  products = [],
}: OverviewCardsProps) {
  const productsCount = products.length.toString().padStart(2, "0");
  const salesCount = sales.length.toString().padStart(2, "0");

  const totalSales = sales.reduce(
    (acc, item) => acc + Number(item.total || 0),
    0
  );

  const analytics = [
    {
      title: "Products",
      count: productsCount,
      unit: "",
      link: "/dashboard/products?report=1",
      icon: Package,
      gradient: "from-orange-500/20 via-blue-500/20 to-purple-500/20",
    },
    {
      title: "Sales",
      count: salesCount,
      unit: "",
      link: "/dashboard/sales",
      icon: ShoppingCart,
      gradient: "from-pink-500/20 via-purple-500/20 to-orange-500/20",
    },
    {
      title: "Total Revenue",
      count: totalSales.toLocaleString("en-IN"),
      unit: "₹",
      link: "/dashboard/sales",
      icon: IndianRupee,
      gradient: "from-emerald-500/20 via-cyan-500/20 to-blue-500/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {analytics.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className={`
              group overflow-hidden rounded-2xl border border-white/10
              bg-white/70 shadow-sm backdrop-blur-xl transition-all duration-300
              hover:-translate-y-1 hover:shadow-xl
              dark:bg-slate-950/60 dark:border-white/10
            `}
          >
            <div
              className={`
                p-5 bg-gradient-to-br ${item.gradient}
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-foreground text-xs font-semibold uppercase tracking-wider">
                    {item.title}
                  </p>

                  <h3 className="text-foreground mt-3 text-2xl font-bold">
                    {item.unit}
                    {item.count}
                  </h3>
                </div>

                <div
                  className="
                    flex h-12 w-12 items-center justify-center rounded-2xl
                    border border-white/20 bg-white/30 text-slate-900
                    shadow-sm backdrop-blur-xl
                    dark:bg-white/10 dark:text-white
                  "
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>

            <Link
              href={item.link}
              className="
                flex items-center justify-between border-t border-white/10
                px-5 py-3 text-sm font-medium text-muted-foreground
                transition-colors hover:bg-white/40 hover:text-foreground
                dark:hover:bg-white/5
              "
            >
              View reports
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
