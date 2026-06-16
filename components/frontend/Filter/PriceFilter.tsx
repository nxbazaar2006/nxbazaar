"use client";

import { Circle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

type PriceFormData = {
  min?: string;
  max?: string;
};

type PriceFilterProps = {
  slug: string;
  isSearch?: boolean;
};

type PriceRange = {
  display: string;
  min?: number;
  max?: number;
};

export default function PriceFilter({ slug, isSearch }: PriceFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const minParam = searchParams.get("min");
  const maxParam = searchParams.get("max");

  const { handleSubmit, reset, register } = useForm<PriceFormData>();

  const priceRanges: PriceRange[] = [
    { display: "Under ₹300", max: 300 },
    { display: "₹300 - ₹500", min: 300, max: 500 },
    { display: "₹500 - ₹700", min: 500, max: 700 },
    { display: "Above ₹700", min: 700 },
  ];

  const createParams = (extra?: { min?: number | string; max?: number | string }) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");

    if (extra?.min !== undefined && extra.min !== "") {
      params.set("min", String(extra.min));
    } else {
      params.delete("min");
    }

    if (extra?.max !== undefined && extra.max !== "") {
      params.set("max", String(extra.max));
    } else {
      params.delete("max");
    }

    if (!isSearch) {
      params.delete("search");
    }

    return params;
  };

  const createUrl = (range: PriceRange) => {
    const params = createParams({
      min: range.min,
      max: range.max,
    });

    return `?${params.toString()}`;
  };

  const resetUrl = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("min");
    params.delete("max");
    params.set("page", "1");

    if (!isSearch) {
      params.delete("search");
    }

    const query = params.toString();

    if (isSearch) {
      return query ? `/search?${query}` : "/search";
    }

    return query ? `/category/${slug}?${query}` : `/category/${slug}`;
  };

  const isActive = (range: PriceRange) => {
    const min = range.min?.toString() ?? null;
    const max = range.max?.toString() ?? null;

    return minParam === min && maxParam === max;
  };

  const onSubmit = (data: PriceFormData) => {
    const params = createParams({
      min: data.min,
      max: data.max,
    });

    const query = params.toString();

    router.push(
      isSearch
        ? query
          ? `/search?${query}`
          : "/search"
        : query
          ? `/category/${slug}?${query}`
          : `/category/${slug}`
    );

    reset();
  };

  return (
    <div className="neumorphic-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Price
        </h2>

        <Link
          href={resetUrl()}
          className="soft-button rounded-full px-4 py-2 text-xs font-medium"
        >
          Reset
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {priceRanges.map((range) => {
          const active = isActive(range);
          const Icon = active ? CheckCircle2 : Circle;

          return (
            <Link
              key={range.display}
              href={createUrl(range)}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                active
                  ? "bg-white/20 text-foreground"
                  : "text-muted-foreground hover:bg-white/20 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{range.display}</span>
            </Link>
          );
        })}
      </div>

      {!isSearch && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 grid grid-cols-3 gap-2"
        >
          <input
            {...register("min")}
            type="number"
            placeholder="Min"
            min={0}
            className="inset-input col-span-1 rounded-full px-3 py-2 text-sm"
          />

          <input
            {...register("max")}
            type="number"
            placeholder="Max"
            min={0}
            className="inset-input col-span-1 rounded-full px-3 py-2 text-sm"
          />

          <button
            type="submit"
            className="soft-button col-span-1 rounded-full text-sm font-medium"
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
}
