import Heading from "@/components/backoffice/Heading";
import LargeCards from "@/components/backoffice/LargeCards";
import SmallCards from "@/components/backoffice/SmallCards";
import DashboardCharts from "@/components/backoffice/DashboardCharts";
import SellerDashboard from "@/components/backoffice/SellerDashboard";
import UserDashboard from "@/components/backoffice/UserDashboard";
import { auth } from "@/auth";

import { getOrders } from "@/actions/orders";
import { getSales } from "@/actions/sales";
import type { Order, Sale } from "@/types/dashboard";

export default async function Page() {
  const session = await auth();
  const role = session?.user?.role;

  const orders = await getOrders();
  const sales = await getSales();

  const dashboardOrders = orders as unknown as Order[];
  const dashboardSales = sales as unknown as Sale[];

  if (role === "USER") return <UserDashboard />;
  if (role === "SELLER") return <SellerDashboard />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="rounded-2xl border border-slate-200 bg-transparent p-5 shadow-none dark:border-white/10">
        <Heading title="Dashboard Overview" />
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* MAIN CHART */}
        <div className="col-span-12 rounded-2xl border border-slate-200 bg-transparent p-5 shadow-none transition-all duration-300 hover:-translate-y-0.5 dark:border-white/10 lg:col-span-7">
          <DashboardCharts sales={dashboardSales} />
        </div>

        {/* SALES CARDS */}
        <div className="col-span-12 rounded-2xl border border-slate-200 bg-transparent p-5 shadow-none transition-all duration-300 hover:-translate-y-0.5 dark:border-white/10 lg:col-span-5">
          <LargeCards sales={dashboardSales} />
        </div>

        {/* ORDER CARDS */}
        <div className="col-span-12 rounded-2xl border border-slate-200 bg-transparent p-5 shadow-none transition-all duration-300 hover:-translate-y-0.5 dark:border-white/10 lg:col-span-5">
          <SmallCards orders={dashboardOrders} />
        </div>

        {/* EMPTY PREMIUM SPACE */}
        <div className="hidden rounded-2xl border border-slate-200 bg-transparent p-5 transition-all duration-300 dark:border-white/10 lg:col-span-7 lg:block">
          <div className="flex h-full min-h-64 items-center justify-center text-slate-600 dark:text-slate-400">
            Premium analytics section
          </div>
        </div>
      </div>
    </div>
  );
}
