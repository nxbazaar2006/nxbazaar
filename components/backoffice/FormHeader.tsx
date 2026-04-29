"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import GlassCard from "@/components/GlassCard"; 

interface Props {
  title: string;
  description?: string;
}

export default function FormHeader({ title, description }: Props) {
  const router = useRouter();

  return (
    <GlassCard className="flex items-center justify-between px-5 py-4">
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-gray-300">
            {description}
          </p>
        )}
      </div>

      <button
        onClick={() => router.back()}
        className="
          w-9 h-9 flex items-center justify-center
          rounded-full

          bg-white/20 border border-white/30
          text-white

          hover:bg-white/30
          backdrop-blur-md
          transition-all
        "
      >
        <X className="w-4 h-4" />
      </button>
    </GlassCard>
  );
}