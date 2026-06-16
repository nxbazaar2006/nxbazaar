"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export default function FormHeader({ title, description }: Props) {
  const router = useRouter();

  return (
    <div className="border bg-card text-card-foreground shadow-sm flex items-center justify-between px-5 py-4">
      <div className="space-y-0.5">
        <h2 className="text-foreground text-lg font-semibold">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-slate-600 dark:text-gray-300">
            {description}
          </p>
        )}
      </div>

      <button
        onClick={() => router.back()}
        className="
          w-9 h-9 flex items-center justify-center
          rounded-full

          bg-primary text-primary-foreground shadow-xs hover:bg-primary/90

          hover:bg-accent
          transition-all
        "
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
