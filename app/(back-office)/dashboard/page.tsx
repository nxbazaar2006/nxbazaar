import Heading from "@/components/backoffice/Heading";
import LargeCards from "@/components/backoffice/LargeCards";
import SmallCards from "@/components/backoffice/SmallCards";
import DashboardCharts from "@/components/backoffice/DashboardCharts";
import SellerDashboard from "@/components/backoffice/SellerDashboard";
import UserDashboard from "@/components/backoffice/UserDashboard";
import { auth } from "@/auth";

import { getOrders } from "@/actions/orders";
import { getProducts } from "@/actions/products";
import { getSales } from "@/actions/sales";

export default async function Page() {
  const session = await auth();
  const role = session?.user?.role;

  const products = await getProducts();
  const orders = await getOrders();
  const sales = await getSales();

  if (role === "USER") return <UserDashboard />;
  if (role === "SELLER") return <SellerDashboard />;

  return (
    <div className="space-y-6">

      {/* 🍎 HEADER (Glass) */}
      <div className="
        backdrop-blur-xl bg-white/10 dark:bg-slate-800/40
        border border-slate-200 dark:border-slate-700
        rounded-2xl px-4 py-4
      ">
        <Heading title="Dashboard Overview" />
      </div>

      {/* 📊 GRID LAYOUT */}
      <div className="grid grid-cols-6 gap-6">

        {/* MAIN CHART */}
        <div className="
          col-span-12 lg:col-span-7
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-700
          rounded-2xl p-5
        ">
          <DashboardCharts sales={sales} />
        </div>

        {/* SALES CARDS */}
        <div className="
          col-span-12 lg:col-span-5
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-700
          rounded-2xl p-5
        ">
          <LargeCards sales={sales} />
        </div>

        {/* ORDER CARDS */}
        <div className="
          col-span-12 lg:col-span-5
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-700
          rounded-2xl p-5
        ">
          <SmallCards orders={orders} />
        </div>

      </div>

    </div>
  );
}