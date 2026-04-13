"use client";

import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";


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

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  const generateData = () =>
  labels.map((_, i) => 500 + i * 200 + Math.floor(Math.random() * 300));

  const tabs = [
    {
      title: "Sales",
      type: "sales",
      color: "#6366f1",
    },
    {
      title: "Orders",
      type: "orders",
      color: "#10b981",
    },
  ];

  const chartData = useMemo(() => {
    const tab = tabs.find((t) => t.type === activeTab);

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
          backgroundColor: (ctx: any) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, `${tab?.color}40`);
            gradient.addColorStop(1, "transparent");
            return gradient;
          },
        },
      ],
    };
  }, [activeTab]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: "easeOutCubic",
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: 10,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#aaa", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#aaa", font: { size: 11 } },
      },
    },
  };

  return (
    <div className="
      backdrop-blur-xl bg-white/5
      border border-white/10
      rounded-2xl p-4
      shadow-[0_10px_40px_rgba(0,0,0,0.25)]
    ">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white/70">
          Weekly Analytics
        </h2>

        {/* TABS */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`
                px-3 py-1 text-xs rounded-full
                transition-all duration-200

                ${
                  activeTab === tab.type
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white"
                }
              `}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      {/* CHART */}
      <div className="h-[220px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}