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
      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "relative w-full overflow-hidden bg-primary text-base font-semibold text-white shadow-sm  hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
      >
        {loading ? (
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
            {loadingButtonTitle}
          </span>
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-2">
            {buttonTitle}
          </span>
        )}
      </Button>
    </div>
  );
}
