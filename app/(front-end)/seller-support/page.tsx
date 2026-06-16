import Link from "next/link";
import {
  BadgeHelp,
  BarChart3,
  Headphones,
  PackagePlus,
  ReceiptText,
  Store,
  Truck,
  WalletCards,
} from "lucide-react";

const supportCards = [
  {
    title: "Seller Onboarding",
    description: "Complete profile, market, GST, and account setup steps.",
    href: "/register-seller",
    icon: Store,
  },
  {
    title: "Add Products",
    description: "Create listings, manage variants, images, pricing, and stock.",
    href: "/dashboard/catalogue/products",
    icon: PackagePlus,
  },
  {
    title: "Orders & Shipping",
    description: "Track new orders, packing status, delivery, and invoices.",
    href: "/dashboard/vendor/orders",
    icon: Truck,
  },
  {
    title: "Payments",
    description: "Review sales, wallet balance, settlement, and payout status.",
    href: "/dashboard/wallet",
    icon: WalletCards,
  },
  {
    title: "Sales Reports",
    description: "Understand revenue, order trends, and best-selling items.",
    href: "/dashboard/sales",
    icon: BarChart3,
  },
  {
    title: "Policy Help",
    description: "Get guidance for returns, cancellations, taxes, and compliance.",
    href: "/support",
    icon: ReceiptText,
  },
];

const faqs = [
  {
    question: "How do I become a seller?",
    answer:
      "Create a seller account, complete your business profile, add required documents, and submit the form for review.",
  },
  {
    question: "Where can I add products?",
    answer:
      "After approval, go to the seller dashboard and open the products section to create or update listings.",
  },
  {
    question: "How are payouts handled?",
    answer:
      "Seller payouts are tracked from the wallet and sales sections. Settlement timing depends on order status and platform policy.",
  },
  {
    question: "What should I do if an order has an issue?",
    answer:
      "Check the order details first, then contact support with the order ID, product name, and issue details.",
  },
];

export default function SellerSupportPage() {
  return (
    <main className="min-h-screen pb-16">
      <section className="rounded-2xl border border-white/40 p-6 backdrop-blur-xl dark:border-white/10 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-xl dark:border-white/10 dark:text-slate-200">
              <Headphones className="h-4 w-4 text-orange-500" />
              Seller Support
            </span>

            <div className="space-y-4">
              <h1 className="max-w-3xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                Help for selling, orders, payouts, and store setup
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300">
                Find seller tools, common workflows, and quick links for managing
                your NXBazaar seller account.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/40 p-6 backdrop-blur-xl dark:border-white/10">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 p-3 text-white">
                <BadgeHelp className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                  Need direct help?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Share your seller email, order ID if available, and a short
                  description so the support team can respond faster.
                </p>
                <Link
                  href="/support"
                  className="mt-5 inline-flex rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-fuchsia-500/20 transition hover:from-orange-400 hover:via-fuchsia-400 hover:to-sky-400"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {supportCards.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-white/40 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-fuchsia-300/70 dark:border-white/10 dark:hover:border-fuchsia-400/40"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/15 via-fuchsia-500/15 to-sky-500/15 text-fuchsia-600 dark:text-fuchsia-300">
                <Icon className="h-6 w-6 transition group-hover:scale-110" />
              </div>
              <h3 className="bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 bg-clip-text text-lg font-semibold text-transparent">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="mt-10 rounded-2xl border border-white/40 p-6 backdrop-blur-xl dark:border-white/10 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr]">
          <div>
            <h2 className="bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 bg-clip-text text-2xl font-semibold text-transparent">
              Seller FAQs
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Quick answers for common seller account and order questions.
            </p>
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-white/10">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-slate-950 dark:text-white">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
