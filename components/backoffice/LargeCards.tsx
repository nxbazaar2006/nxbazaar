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
    <div className="grid gap-4 md:grid-cols-2">
      <LargeCard
        title="Total Revenue"
        value={`₹ ${totalRevenue.toLocaleString("en-IN")}`}
        icon={<DollarSign className="h-6 w-6 text-emerald-500" />}
        className=""
      />

      <LargeCard
        title="Total Sales"
        value={totalSales}
        icon={<ShoppingCart className="h-6 w-6 text-foreground" />}
        className=""
      />
    </div>
  );
}
