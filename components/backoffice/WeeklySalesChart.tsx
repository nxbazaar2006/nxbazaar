"use client";

import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import type { ChartOptions, ScriptableContext } from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";
import type { Order, Sale } from "@/types/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

type Props = {
  orders: Order[];
  sales: Sale[];
};

const formatDayKey = (date: Date) => date.toISOString().slice(0, 10);

const getDateValue = (value: string | Date) =>
  value instanceof Date ? value : new Date(value);

export default function WeeklySalesChart({ orders = [], sales = [] }: Props) {
  const [activeTab, setActiveTab] = useState("sales");
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  const dayBuckets = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en", {
      day: "2-digit",
      month: "short",
    });
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - (6 - index));

      return {
        key: formatDayKey(date),
        label: formatter.format(date),
      };
    });
  }, []);

  const labels = dayBuckets.map((day) => day.label);

  const salesData = useMemo(() => {
    const totals = new Map(dayBuckets.map((day) => [day.key, 0]));

    sales.forEach((sale) => {
      if (!sale.createdAt) return;

      const key = formatDayKey(getDateValue(sale.createdAt));
      totals.set(key, (totals.get(key) ?? 0) + sale.total);
    });

    return dayBuckets.map((day) => totals.get(day.key) ?? 0);
  }, [dayBuckets, sales]);

  const ordersData = useMemo(() => {
    const totals = new Map(dayBuckets.map((day) => [day.key, 0]));

    orders.forEach((order) => {
      if (!order.createdAt) return;

      const key = formatDayKey(getDateValue(order.createdAt));
      totals.set(key, (totals.get(key) ?? 0) + 1);
    });

    return dayBuckets.map((day) => totals.get(day.key) ?? 0);
  }, [dayBuckets, orders]);

  const tabs = useMemo(
    () => [
      { title: "Sales", type: "sales", color: "#0ea5e9" },
      { title: "Orders", type: "orders", color: "#f97316" },
    ],
    []
  );

  const chartData = useMemo(() => {
    const tab = tabs.find((t) => t.type === activeTab);
    const fillAlpha = isDark ? "40" : "24";

    return {
      labels,
      datasets: [
        {
          data: activeTab === "sales" ? salesData : ordersData,
          borderColor: tab?.color,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          backgroundColor: (ctx: ScriptableContext<"line">) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, `${tab?.color}${fillAlpha}`);
            gradient.addColorStop(1, "transparent");
            return gradient;
          },
        },
      ],
    };
  }, [activeTab, isDark, labels, ordersData, salesData, tabs]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: "easeOutCubic" as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.96)",
        titleColor: isDark ? "#fff" : "#0f172a",
        bodyColor: isDark ? "#e2e8f0" : "#334155",
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(148,163,184,0.28)",
        borderWidth: 1,
        cornerRadius: 10,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? "#cbd5e1" : "#475569", font: { size: 11 } },
      },
      y: {
        grid: { color: isDark ? "rgba(255,255,255,0.08)" : "rgba(148,163,184,0.18)" },
        ticks: { color: isDark ? "#cbd5e1" : "#475569", font: { size: 11 } },
      },
    },
  };

  return (
    <div className="relative z-10 flex h-full w-full flex-col">
      <div className="mb-5 flex min-h-8 items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Weekly Analytics
        </h2>

        <div className="flex h-8 gap-1 rounded-full border border-slate-950/10 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                activeTab === tab.type
                  ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                  : "text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
