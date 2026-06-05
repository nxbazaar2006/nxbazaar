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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function WeeklySalesChart() {
  const [activeTab, setActiveTab] = useState("sales");
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  const generateData = () =>
    labels.map((_, i) => 500 + i * 200 + Math.floor(Math.random() * 300));

  const tabs = [
    { title: "Sales", type: "sales", color: "#0ea5e9" },
    { title: "Orders", type: "orders", color: "#f97316" },
  ];

  const chartData = useMemo(() => {
    const tab = tabs.find((t) => t.type === activeTab);
    const fillAlpha = isDark ? "40" : "24";

    return {
      labels,
      datasets: [
        {
          data: generateData(),
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
  }, [activeTab, isDark]);

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
    <div className="rounded-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Weekly Analytics
        </h2>

        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`rounded-md px-3 py-1 text-xs transition-all duration-200 ${
                activeTab === tab.type
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-100 text-slate-700 hover:text-cyan-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-100"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[220px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
