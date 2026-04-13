import LargeCard from "./LargeCard";
import { DollarSign, ShoppingCart } from "lucide-react";
import { Sale } from "@/types/dashboard";

type Props = {
  sales: Sale[];
};

export default function LargeCards({ sales }: Props) {
  const totalRevenue = sales.reduce((acc, item) => acc + item.total, 0);
  const totalSales = sales.length;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      
      <LargeCard
        title="Total Revenue"
        value={`₹ ${totalRevenue}`}
        icon={<DollarSign className="w-6 h-6 text-indigo-500" />}
      />

      <LargeCard
        title="Total Sales"
        value={totalSales}
        icon={<ShoppingCart className="w-6 h-6 text-pink-500" />}
      />

    </div>
  );
}