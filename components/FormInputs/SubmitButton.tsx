"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  isLoading: boolean;
  buttonTitle: string;
  loadingButtonTitle: string;
  className?: string;
};

export default function SubmitButton({
  isLoading,
  buttonTitle,
  loadingButtonTitle,
  className,
}: Props) {
  return (
    <div className="relative w-full group">
      {/* 🔥 Soft Glow (subtle for forms) */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 opacity-20 blur-md group-hover:opacity-30 transition" />

      <Button
        type="submit"
        disabled={isLoading}
        className={cn(
          `
          relative w-full py-3 rounded-2xl overflow-hidden

          font-medium tracking-tight text-white

          /* 🧊 Glass Effect */
          bg-white/10 backdrop-blur-md
          border border-white/20

          /* ✨ Smooth UI */
          transition-all duration-300 ease-in-out

          /* 🚀 Hover */
          hover:bg-white/20 hover:scale-[1.01]

          /* ⚡ Click */
          active:scale-[0.97]

          /* 💎 Shadow */
          shadow-lg

          /* 🚫 Disabled */
          disabled:opacity-60 disabled:cursor-not-allowed
        `,
          className
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {loadingButtonTitle}
          </span>
        ) : (
          <span className="relative z-10">{buttonTitle}</span>
        )}

        {/* ✨ Shine Effect */}
        <span
          className="
            absolute inset-0
            bg-gradient-to-r from-transparent via-white/40 to-transparent
            translate-x-[-100%]
            group-hover:translate-x-[100%]
            transition-transform duration-700
          "
        />
      </Button>
    </div>
  );
}