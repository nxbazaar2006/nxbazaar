"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/data-table-components/DataTable";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { columns } from "./columns";
import { Category } from "@/types/category";

type Locale = "en" | "hi" | "mr";

interface Props {
  initialData: Category[];
}

export default function CategoriesClient({ initialData }: Props) {
  const [locale, setLocale] = useState<Locale>("en");

  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ["categories", locale],
    queryFn: async () => {
      const res = await fetch(`/api/categories?locale=${locale}`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    initialData,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <LanguageSwitcher
          locale={locale}
          setLocale={(value) => setLocale(value as Locale)}
        />
      </div>

      {error && (
        <div className="border bg-card text-card-foreground shadow-sm rounded-2xl border-red-400 p-4">
          <p className="text-red-400">Failed to load categories</p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data ?? []}
        endpoint="categories"
        queryKey={["categories", locale]}
        filterKeys={["translations.0.title"]}
        isLoading={isLoading}
      />
    </div>
  );
}
