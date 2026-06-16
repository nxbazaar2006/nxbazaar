import SmallCard from "./SmallCard";
import { CheckCircle2, Clock, PackageCheck, ShoppingBag } from "lucide-react";
import { Order } from "@/types/dashboard";

interface Props {
  orders: Order[];
}

export default function SmallCards({ orders = [] }: Props) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.orderStatus === "PENDING").length;
  const processingOrders = orders.filter((order) => order.orderStatus === "PROCESSING").length;
  const deliveredOrders = orders.filter((order) => order.orderStatus === "DELIVERED").length;

  return (
    <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="grid min-w-[640px] grid-cols-4 gap-3">
        <SmallCard
          title="Total Orders"
          value={totalOrders}
          icon={<ShoppingBag className="h-4 w-4" />}
          tone="sky"
        />
        <SmallCard
          title="Pending"
          value={pendingOrders}
          icon={<Clock className="h-4 w-4" />}
          tone="amber"
        />
        <SmallCard
          title="Processing"
          value={processingOrders}
          icon={<PackageCheck className="h-4 w-4" />}
          tone="violet"
        />
        <SmallCard
          title="Delivered"
          value={deliveredOrders}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="emerald"
        />
      </div>
    </div>
  );
}
