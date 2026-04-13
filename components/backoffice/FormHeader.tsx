"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Props {
  title: string;
}

export default function FormHeader({ title }: Props) {
  const router = useRouter();

  return (
    <div className="
      flex items-center justify-between
      px-6 py-3
      bg-white dark:bg-slate-900
      border border-slate-200 dark:border-slate-700
      rounded-xl
    ">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>

      <button
        onClick={() => router.back()}
        className="
          p-2 rounded-lg
          hover:bg-slate-100 dark:hover:bg-slate-800
        "
      >
        <X />
      </button>
    </div>
  );
}