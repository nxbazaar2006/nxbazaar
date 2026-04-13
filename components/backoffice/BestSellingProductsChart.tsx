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

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BestSellingProductsChart() {
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
          color: "#94a3b8",
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#fff",
        bodyColor: "#cbd5f5",
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
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