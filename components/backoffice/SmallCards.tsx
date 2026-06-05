import SmallCard from "./SmallCard";
import { ShoppingBag } from "lucide-react";
import { Order } from "@/types/dashboard";

interface Props {
  orders: Order[];
}

export default function SmallCards({ orders }: Props) {
  const totalOrders = orders.length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <SmallCard
        title="Total Orders"
        value={totalOrders}
        icon={<ShoppingBag className="w-5 h-5 text-cyan-300" />}
        className=""
      />
    </div>
  );
}
