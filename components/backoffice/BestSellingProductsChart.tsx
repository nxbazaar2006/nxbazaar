"use client";

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { useTheme } from "next-themes";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BestSellingProductsChart() {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  const data = {
    labels: ["Cabbage", "Watermelon", "Broccoli", "Maize"],
    datasets: [
      {
        label: "Sales",
        data: [50, 10, 20, 20],
        backgroundColor: [
          "#6366F1", // Indigo
          "#EC4899", // Pink
          "#10B981", // Green
          "#F59E0B", // Amber
        ],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: isDark ? "#cbd5e1" : "#475569",
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        titleColor: isDark ? "#fff" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#334155",
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(148,163,184,0.28)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="flex h-full flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Best Selling Products
        </h2>
      </div>

      {/* Chart */}
      <div className="h-[300px] flex items-center justify-center">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}
