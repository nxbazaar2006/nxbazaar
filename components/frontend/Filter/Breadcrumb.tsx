"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type BreadcrumbProps = {
  title: string;
  resultCount: number;
  pageSize?: number;
};

export default function Breadcrumb({
  title,
  resultCount,
  pageSize = 12,
}: BreadcrumbProps) {
  const searchParams = useSearchParams();

  const currentPage = Math.max(
    1,
    Number.parseInt(searchParams.get("page") || "1", 10)
  );

  const startRange =
    resultCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;

  const endRange =
    resultCount > 0
      ? Math.min(currentPage * pageSize, resultCount)
      : 0;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Link
          href="/"
          className="hover:text-foreground transition-colors"
        >
          Home
        </Link>

        <ChevronRight className="h-4 w-4" />

        <span className="font-medium text-foreground">
          {title}
        </span>
      </div>

      <p>
        {startRange}-{endRange} of {resultCount} results
      </p>
    </div>
  );
}