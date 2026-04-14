"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import DataTable from "@/components/data-table-components/DataTable";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

import { columns } from "./columns";
import { Category } from "@/types/category";

interface CategoriesClientProps {
  initialData: Category[];
}

type Locale = "en" | "hi" | "mr";

export default function CategoriesClient({
  initialData,
}: CategoriesClientProps) {
  const [locale, setLocale] = useState<Locale>("en");

  const { data, isLoading } = useQuery<Category[]>({
    queryKey: ["categories", locale],
    queryFn: async () => {
      const response = await fetch(
        `/api/categories?locale=${locale}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      return response.json();
    },
    initialData,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  return (
    <div className="p-6 space-y-4">
      {/* 🔥 Locale Switch */}
      <LanguageSwitcher
        locale={locale}
        setLocale={setLocale}
      />

      {/* 🔥 Data Table */}
      <DataTable
        columns={columns}
        data={data ?? []}
        filterKeys={["translations.0.title"]}
        isLoading={isLoading}
      />
    </div>
  );
}
