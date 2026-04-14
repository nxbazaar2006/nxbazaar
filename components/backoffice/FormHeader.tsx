"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Card from "@/components/ui/card";

interface Props {
  title: string;
  description?: string;
}

export default function FormHeader({ title, description }: Props) {
  const router = useRouter();

  return (
    <Card className="flex items-center justify-between px-5 py-4">
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>

        {description && (
          <p>
            {description}
          </p>
        )}
      </div>

      <button
        onClick={() => router.back()}
        className="
          w-9 h-9 flex items-center justify-center
          rounded-full

          bg-gray-100 dark:bg-slate-800
          text-gray-700 dark:text-white

          hover:bg-gray-200 dark:hover:bg-slate-700
          transition-all
        "
      >
        <X className="w-4 h-4" />
      </button>
    </Card>
  );
}