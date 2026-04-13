"use client";

import { motion } from "framer-motion";

export default function GlassCard({ children, className }: any) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`apple-glass apple-shadow rounded-2xl p-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}