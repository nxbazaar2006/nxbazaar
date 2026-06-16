"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

import CategoryList from "./CategoryList";

type Category = React.ComponentProps<typeof CategoryList>["category"];

type Props = {
  categories: Category[];
  lang?: string;
};

export default function HomeCategoryFilter({ categories, lang }: Props) {
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      if (selectedSlug && category.slug !== selectedSlug) return false;
      if (!normalizedQuery) return true;

      const categoryMatches = category.title
        .toLowerCase()
        .includes(normalizedQuery);
      const productMatches = category.products?.some((product) =>
        product.title.toLowerCase().includes(normalizedQuery)
      );

      return categoryMatches || productMatches;
    });
  }, [categories, normalizedQuery, selectedSlug]);

  return (
    <section className="space-y-6 py-8">
      <div className="border bg-card text-card-foreground shadow-sm flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Browse Products
          </p>
          <h2 className="text-foreground mt-1 text-xl font-semibold tracking-tight">
            Filter home categories
          </h2>
        </div>

        <label className="flex w-full items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm dark:bg-white/10 sm:max-w-sm">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Filter categories and products</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search category or product..."
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="rounded-full p-1 text-muted-foreground transition hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      <div className="border bg-card text-card-foreground shadow-sm rounded-2xl px-12 py-4">
        <Carousel opts={{ align: "start", containScroll: "trimSnaps" }}>
          <CarouselContent>
            <CarouselItem className="basis-auto">
              <button
                type="button"
                onClick={() => setSelectedSlug(null)}
                className={cn(
                  "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:bg-white/10 dark:text-slate-200",
                  selectedSlug === null &&
                    "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                )}
              >
                All Categories
              </button>
            </CarouselItem>

            {categories.map((category) => (
              <CarouselItem key={category.slug} className="basis-auto">
                <button
                  type="button"
                  onClick={() => setSelectedSlug(category.slug)}
                  className={cn(
                    "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:bg-white/10 dark:text-slate-200",
                    selectedSlug === category.slug &&
                      "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  )}
                >
                  {category.title}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="-left-10 bg-white/60 backdrop-blur-xl dark:bg-slate-950/60" />
          <CarouselNext className="-right-10 bg-white/60 backdrop-blur-xl dark:bg-slate-950/60" />
        </Carousel>
      </div>

      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => (
          <div className="py-2" key={category.slug}>
            <CategoryList
              isMarketPage={false}
              category={category}
              lang={lang}
            />
          </div>
        ))
      ) : (
        <div className="border bg-card text-card-foreground shadow-sm rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No matching categories or products found.
        </div>
      )}
    </section>
  );
}
