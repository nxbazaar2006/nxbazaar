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

  const dashboardOrders = Array.isArray(orders)
    ? (orders as unknown as Order[])
    : [];

  const dashboardSales = Array.isArray(sales)
    ? (sales as unknown as Sale[])
    : [];

  if (role === "USER") return <UserDashboard />;
  if (role === "SELLER") return <SellerDashboard />;

  return (
    <div className="min-h-[calc(100vh-9rem)] space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div
        className="
          relative overflow-hidden
          rounded-[28px]
          border bg-card text-card-foreground shadow-sm
          p-4
          sm:p-6
        "
      >
        <div className="relative z-10">
          <Heading
            title="Dashboard Overview"
           
          />
        </div>
      </div>

      {/* Cards */}
      <div className="relative overflow-hidden rounded-[28px]">
        <LargeCards sales={dashboardSales} />
      </div>

      {/* Charts */}
      <div
        className="
          relative overflow-hidden
          rounded-[28px]
          border bg-card text-card-foreground shadow-sm
          p-3
          sm:p-4
        "
      >
        <div className="relative z-10">
          <DashboardCharts orders={dashboardOrders} sales={dashboardSales} />
        </div>
      </div>

      {/* Small Cards */}
      <div className="relative overflow-hidden rounded-[28px]">
        <SmallCards orders={dashboardOrders} />
      </div>
    </div>
  );
}
