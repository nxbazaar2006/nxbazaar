"use client";

import { Button } from "@/components/ui/button";

type Props = {
  isLoading: boolean;
  buttonTitle: string;
  loadingButtonTitle: string;
};

export default function SubmitButton({
  isLoading,
  buttonTitle,
  loadingButtonTitle,
}: Props) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      className="
        w-full py-3 rounded-2xl

        font-medium tracking-tight text-white

        /* 🔥 Gradient */
        bg-gradient-to-r from-orange-500 to-orange-600
        dark:from-orange-600 dark:to-orange-700

        /* 🍎 Smooth UI */
        transition-all duration-300 ease-in-out

        /* ✨ Hover */
        hover:from-orange-600 hover:to-orange-700
        dark:hover:from-orange-500 dark:hover:to-orange-600

        /* 💎 Shadow */
        shadow-md hover:shadow-lg

        /* ⚡ Animation */
        hover:scale-[1.01]
        active:scale-[0.97]

        /* 🚫 Disabled */
        disabled:opacity-60 disabled:cursor-not-allowed
      "
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          {/* 🔄 Spinner */}
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {loadingButtonTitle}
        </span>
      ) : (
        buttonTitle
      )}
    </Button>
  );
}