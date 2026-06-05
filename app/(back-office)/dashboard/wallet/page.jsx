import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  ArrowDownToLine,
  CircleDollarSign,
  Clock3,
  ReceiptText,
} from "lucide-react";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currency.format(Number(value ?? 0));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function WalletPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100">
        Unauthorized
      </div>
    );
  }

  const isAdmin = session.user.role === "ADMIN";
  const sales = await db.sale.findMany({
    where: isAdmin ? undefined : { vendorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          orderNumber: true,
          firstName: true,
          lastName: true,
          orderStatus: true,
        },
      },
      product: {
        select: {
          title: true,
          productCode: true,
        },
      },
      vendor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const totalEarnings = sales.reduce((sum, sale) => sum + sale.total, 0);
  const pendingEarnings = sales
    .filter((sale) => sale.order?.orderStatus !== "DELIVERED")
    .reduce((sum, sale) => sum + sale.total, 0);
  const availableBalance = totalEarnings - pendingEarnings;
  const latestSales = sales.slice(0, 10);
  const cards = [
    {
      title: "Available Balance",
      value: formatCurrency(availableBalance),
      icon: CircleDollarSign,
      tone: "from-emerald-500 to-sky-500",
    },
    {
      title: "Pending Clearance",
      value: formatCurrency(pendingEarnings),
      icon: Clock3,
      tone: "from-orange-500 to-amber-500",
    },
    {
      title: "Total Earnings",
      value: formatCurrency(totalEarnings),
      icon: ReceiptText,
      tone: "from-sky-500 to-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-sky-700 dark:text-cyan-200">
            Finance
          </p>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Wallet
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Track earnings, pending clearance, and recent wallet activity.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Withdraw
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <section
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20"
            >
              <div
                className={`mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r ${card.tone} text-white`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {card.title}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                {card.value}
              </h2>
            </section>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">
            Recent Earnings
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Product</th>
                {isAdmin && <th className="px-5 py-3 font-medium">Seller</th>}
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {latestSales.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    No wallet activity yet.
                  </td>
                </tr>
              ) : (
                latestSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-5 py-4 font-medium text-slate-950 dark:text-white">
                      {sale.order?.orderNumber ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      {sale.product?.title ?? sale.productId}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                        {sale.vendor?.name ??
                          sale.vendor?.email ??
                          sale.vendorId}
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-cyan-500/10 dark:text-cyan-200">
                        {sale.order?.orderStatus ?? "PENDING"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-950 dark:text-white">
                      {formatCurrency(sale.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
