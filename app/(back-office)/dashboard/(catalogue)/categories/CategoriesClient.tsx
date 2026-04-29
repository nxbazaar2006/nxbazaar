"use client";

import GlassCard from "@/components/GlassCard";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/data-table-components/DataTable";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import PageHeader from "@/components/backoffice/PageHeader";
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
    <div className="p-6 space-y-6">
      <PageHeader
        heading="Categories"
        subHeading="Manage your categories"
        href="/dashboard/categories/new"
        linkTitle="Add Category"
      />

      <GlassCard className="flex justify-end">
        <LanguageSwitcher locale={locale} setLocale={setLocale} />
      </GlassCard>

      {error && (
        <GlassCard className="border-red-400">
          <p className="text-red-400">Failed to load categories</p>
        </GlassCard>
      )}

      <GlassCard className="p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={data ?? []}
          filterKeys={["translations.0.title"]}
          isLoading={isLoading}
        />
      </GlassCard>
    </div>
  );
}