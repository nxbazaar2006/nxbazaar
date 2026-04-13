"use client";
import React from "react";
import WeeklySalesChart from "./WeeklySalesChart";
import BestSellingProductsChart from "./BestSellingProductsChart";
import { motion } from "framer-motion";

export default function DashboardCharts({ sales }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">

      {/* Weekly Sales */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl p-2 border border-white/10
        hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]
        transition-all duration-300"
      >
        <WeeklySalesChart />
      </motion.div>

      {/* Best Selling */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="glass rounded-xl p-4 border border-white/10
        hover:shadow-[0_0_40px_rgba(236,72,153,0.4)]
        transition-all duration-300"
      >
        <BestSellingProductsChart />
      </motion.div>

    </div>
  );
}