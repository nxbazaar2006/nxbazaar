"use client";
import React from "react";
import WeeklySalesChart from "./WeeklySalesChart";
import BestSellingProductsChart from "./BestSellingProductsChart";
import { motion } from "framer-motion";
import type { Sale } from "@/types/dashboard";

export default function DashboardCharts({}: { sales: Sale[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

      {/* Weekly Sales */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200/60 transition-all duration-300 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20"
      >
        <WeeklySalesChart />
      </motion.div>

      {/* Best Selling */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200/60 transition-all duration-300 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20"
      >
        <BestSellingProductsChart />
      </motion.div>

    </div>
  );
}
