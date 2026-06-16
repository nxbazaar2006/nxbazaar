"use client";

import React from "react";
import WeeklySalesChart from "./WeeklySalesChart";
import BestSellingProductsChart from "./BestSellingProductsChart";
import type { Order, Sale } from "@/types/dashboard";

type Props = {
  orders?: Order[];
  sales?: Sale[];
};

export default function DashboardCharts({ orders = [], sales = [] }: Props) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
      <div
        className="neumorphic-card flex min-h-[390px] p-4 sm:p-5"
      >
        <WeeklySalesChart orders={orders} sales={sales} />
      </div>

      <div
        className="neumorphic-card flex min-h-[390px] p-4 sm:p-5"
      >
        <BestSellingProductsChart sales={sales} />
      </div>
    </div>
  );
}
