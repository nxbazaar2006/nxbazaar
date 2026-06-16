"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { useTheme } from "next-themes";
import type { Sale } from "@/types/dashboard";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  sales?: Sale[];
};

export default function BestSellingProductsChart({ sales = [] }: Props) {
  const { theme, resolvedTheme } = useTheme();

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  const products = useMemo(() => {
    return Array.from(
      sales.reduce((acc, sale) => {
        const title = sale.productTitle?.trim() || "Unknown Product";
        const qty = Number(sale.productQty ?? 1);

        acc.set(title, (acc.get(title) ?? 0) + qty);
        return acc;
      }, new Map<string, number>())
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [sales]);

  const hasProducts = products.length > 0;

  const data = {
    labels: products.map(([title]) => title),
    datasets: [
      {
        label: "Quantity",
        data: products.map(([, qty]) => qty),
        backgroundColor: ["#6366F1", "#EC4899", "#10B981", "#F59E0B"],
        borderColor: isDark
          ? "rgba(15,23,42,0.9)"
          : "rgba(255,255,255,0.9)",
        borderWidth: 3,
        hoverOffset: 12,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: isDark ? "#cbd5e1" : "#475569",
          padding: 18,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark
          ? "rgba(15,23,42,0.95)"
          : "rgba(255,255,255,0.95)",
        titleColor: isDark ? "#ffffff" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#334155",
        borderColor: isDark
          ? "rgba(255,255,255,0.12)"
          : "rgba(148,163,184,0.28)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
      },
    },
  };

  return (
    <div className="relative z-10 flex h-full w-full flex-col">
      <div className="mb-5 flex min-h-8 items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Best Selling Products
          </h2>
        </div>
      </div>

      {hasProducts ? (
        <div className="relative min-h-0 flex-1">
          <Pie data={data} options={options} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-slate-950/5 bg-white/70 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          No sales data available
        </div>
      )}
    </div>
  );
}
