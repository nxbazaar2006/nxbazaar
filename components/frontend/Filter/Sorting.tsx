"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type SortingProps = {
  title: string;
  slug: string;
  isSearch?: boolean;
};

type SortValue = "asc" | "desc" | null;

export default function Sorting({ title, slug, isSearch }: SortingProps) {
  const searchParams = useSearchParams();
  const sortParam = searchParams.get("sort");

  const createUrl = (sort: SortValue) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");

    if (sort) {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    if (!isSearch) {
      params.delete("search");
    }

    const query = params.toString();

    if (isSearch) {
      return query ? `/search?${query}` : "/search";
    }

    return query ? `/category/${slug}?${query}` : `/category/${slug}`;
  };

  const sortingLinks = [
    {
      title: "Relevance",
      sort: null,
      href: createUrl(null),
    },
    {
      title: "Price - High to Low",
      sort: "desc" as const,
      href: createUrl("desc"),
    },
    {
      title: "Price - Low to High",
      sort: "asc" as const,
      href: createUrl("asc"),
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {isSearch ? "Search Results - " : ""}
        {title}
      </h2>

      <div className="flex items-center gap-3 text-sm">
        <p className="text-slate-500 dark:text-white/55">Sort by:</p>

        <div className="flex flex-wrap items-center gap-2">
          {sortingLinks.map((link) => {
            const active =
              link.sort === null
                ? !sortParam
                : link.sort === sortParam;

            return (
              <Link
                key={link.title}
                href={link.href}
                className={`rounded-full border px-3 py-1.5 transition ${
                  active
                    ? "border-white/70 bg-white/70 text-foreground shadow-sm dark:border-white/15 dark:bg-white/20"
                    : "border-white/60 bg-white/40 text-muted-foreground hover:bg-white/60 hover:text-foreground dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
                }`}
              >
                {link.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
