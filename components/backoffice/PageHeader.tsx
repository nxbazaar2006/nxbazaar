"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  heading: string;
  href?: string;
  linkTitle?: string;
  subHeading?: string;
}

export default function PageHeader({
  heading,
  href,
  linkTitle,
  subHeading,
}: Props) {
  return (
    <div className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">

      <div className="flex items-end justify-between">

        {/* LEFT */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white">
            {heading}
          </h1>

          {subHeading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subHeading}
            </p>
          )}
        </div>

        {/* RIGHT */}
        {href && linkTitle && (
          <Link href={href}>
            <Button
              className="
                flex items-center gap-2
                rounded-full px-5 py-2 text-sm font-medium
                bg-primary text-white
                hover:opacity-90
              "
            >
              <Plus className="w-4 h-4" />
              {linkTitle}
            </Button>
          </Link>
        )}

      </div>

    </div>
  );
}