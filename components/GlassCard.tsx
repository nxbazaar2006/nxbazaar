"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export default function GlassCard({
  children,
  className = "",
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`apple-glass apple-shadow rounded-2xl p-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}