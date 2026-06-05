"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";

type PaginateProps = {
  totalPages: number;
  isSearch?: boolean;
};

export default function Paginate({ totalPages, isSearch }: PaginateProps) {
  const searchParams = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get("page") ?? 1));

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(page));

    if (!isSearch) {
      params.delete("search");
    }

    return `?${params.toString()}`;
  };

  if (!totalPages || totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4];
    }

    if (currentPage >= totalPages - 2) {
      return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [currentPage - 1, currentPage, currentPage + 1];
  };

  const pages = getPages();

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPageUrl(Math.max(1, currentPage - 1))}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>

        {pages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={createPageUrl(1)}>1</PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={createPageUrl(page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink href={createPageUrl(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href={createPageUrl(Math.min(totalPages, currentPage + 1))}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}