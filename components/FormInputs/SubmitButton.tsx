"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

type Props = {
  buttonTitle: string;
  loadingButtonTitle?: string;
  className?: string;

  // optional override
  isLoading?: boolean;
};

export default function SubmitButton({
  buttonTitle,
  loadingButtonTitle = "Submitting...",
  className,
  isLoading,
}: Props) {
  const form = useFormContext();

  const loading = isLoading ?? form?.formState?.isSubmitting;

  return (
    <div className="group relative mx-auto w-full max-w-xs">
      <div className="absolute -inset-1 rounded-2xl bg-[conic-gradient(from_180deg_at_50%_50%,#22d3ee_0%,#a855f7_25%,#f472b6_50%,#22d3ee_75%,#a855f7_100%)] opacity-75 blur-md transition duration-300 group-hover:opacity-100" />
      <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))] backdrop-blur-2xl" />

      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "glass-gradient relative w-full overflow-hidden text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
      >
        <span className="absolute inset-[1px] rounded-[15px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_55%)]" />
        <span className="absolute inset-[1px] rounded-[15px] bg-gradient-to-r from-cyan-400/0 via-white/20 to-fuchsia-400/0 translate-x-[-120%] transition-transform duration-700 group-hover:translate-x-[120%]" />
        <span className="absolute inset-[1px] rounded-[15px] border border-white/8" />

        {loading ? (
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
            {loadingButtonTitle}
          </span>
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.95)]" />
            {buttonTitle}
          </span>
        )}
      </Button>
    </div>
  );
}
