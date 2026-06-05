"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeSwitcherBtn() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      suppressHydrationWarning
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-8 w-14 items-center rounded-full border border-slate-200 bg-white/80 p-1 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_20px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 dark:border-white/20 dark:bg-black/30 dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.24),0_8px_20px_rgba(0,0,0,0.18)]"
    >
      <motion.span
        key={currentTheme ?? "system"}
        suppressHydrationWarning
        initial={false}
        animate={{
          x: isDark ? 24 : 0,
          rotate: isDark ? 0 : 180,
        }}
        transition={{ duration: 0.3 }}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-white text-slate-900 shadow-md dark:from-slate-700 dark:to-slate-950 dark:text-white"
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </motion.span>
    </button>
  );
}
