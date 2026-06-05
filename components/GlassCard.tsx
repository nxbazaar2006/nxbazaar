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
      className={`rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40 ${className}`}
    >
      {children}
    </motion.div>
  );
}
