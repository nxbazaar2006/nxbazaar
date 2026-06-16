import Link from "next/link";
import {
  BadgeHelp,
  BarChart3,
  FileText,
  Headphones,
  PackagePlus,
  Store,
  Truck,
  WalletCards,
} from "lucide-react";

const supportCards = [
  {
    title: "Seller Profile",
    description: "Review account details, role, and seller access.",
    href: "/dashboard/profile",
    icon: Store,
  },
  {
    title: "Product Listings",
    description: "Create, update, and manage products, variants, and stock.",
    href: "/dashboard/catalogue/products",
    icon: PackagePlus,
  },
  {
    title: "Vendor Orders",
    description: "Check order status, packing flow, and delivery updates.",
    href: "/dashboard/vendor/orders",
    icon: Truck,
  },
  {
    title: "Wallet & Payouts",
    description: "Track earnings, pending clearance, and settlement activity.",
    href: "/dashboard/wallet",
    icon: WalletCards,
  },
  {
    title: "Sales Reports",
    description: "Review revenue, sales history, and order performance.",
    href: "/dashboard/sales",
    icon: BarChart3,
  },
  {
    title: "Documents & Policy",
    description: "Get help with invoices, tax details, returns, and policies.",
    href: "/support",
    icon: FileText,
  },
];

const faqs = [
  {
    question: "How do I add a new product?",
    answer:
      "Open Products from the dashboard, choose New Product, fill product details, add images and variants, then submit.",
  },
  {
    question: "Where can I check my seller orders?",
    answer:
      "Use Vendor Orders to see orders assigned to your seller account and track their current status.",
  },
  {
    question: "How can I view payout details?",
    answer:
      "Open Wallet to review available balance, pending clearance, total earnings, and recent activity.",
  },
  {
    question: "What details should I share with support?",
    answer:
      "Share seller email, order number if applicable, product code, screenshots, and a short issue summary.",
  },
];

export default function SellerSupportDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/50 p-6 backdrop-blur-xl dark:border-white/10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:text-slate-200">
              <Headphones className="h-4 w-4 text-orange-500" />
              Seller Support
            </p>
            <h1 className="text-foreground mt-5 text-3xl font-bold tracking-tight md:text-4xl">
              Seller help for products, orders, payouts, and policies
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Use these dashboard shortcuts to solve common seller tasks quickly.
            </p>
          </div>

          <div className="rounded-2xl border border-white/50 p-5 dark:border-white/10 lg:max-w-sm">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
                <BadgeHelp className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-foreground font-semibold">
                  Need manual support?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Include your seller email and order ID so support can respond faster.
                </p>
                <Link
                  href="/support"
                  className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {supportCards.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-white/50 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-fuchsia-300/70 dark:border-white/10 dark:hover:border-fuchsia-400/40"
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
              >
                <Icon className="h-6 w-6 transition group-hover:scale-110" />
              </div>
              <h2 className="text-foreground text-lg font-semibold">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-white/50 p-6 backdrop-blur-xl dark:border-white/10">
        <h2 className="text-foreground text-2xl font-semibold">
          Common Seller Questions
        </h2>
        <div className="mt-5 divide-y divide-slate-200/70 dark:divide-white/10">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
              <h3 className="text-foreground font-semibold">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
