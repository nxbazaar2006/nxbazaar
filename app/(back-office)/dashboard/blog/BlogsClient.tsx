"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { BlogType } from "@/types/blog.types";
import { apiClient } from "@/lib/apiRequest";

export default function BlogsClient({
  initialData,
}: {
  initialData: BlogType[];
}) {
  const [locale, setLocale] = useState<"en" | "hi" | "mr">("en");

  const { data = initialData } = useQuery({
    queryKey: ["blogs", locale],
    queryFn: () =>
      apiClient.get<BlogType[]>(`/blogs?locale=${locale}`),
  });

  return (
    <div className="p-6 space-y-4">
      <LanguageSwitcher locale={locale} setLocale={setLocale} />

      <DataTable
        columns={columns}
        data={data}
        filterKeys={["slug"]}
      />
    </div>
  );
}