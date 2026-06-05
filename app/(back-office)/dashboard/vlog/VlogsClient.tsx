"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { VlogType } from "@/types/vlog.types";
import { apiClient } from "@/lib/apiRequest";

export default function VlogsClient({
  initialData,
}: {
  initialData: VlogType[];
}) {
  const [locale, setLocale] = useState<"en" | "hi" | "mr">("en");

  const { data = initialData } = useQuery({
    queryKey: ["vlogs", locale],
    queryFn: () =>
      apiClient.get<VlogType[]>(`/vlogs?locale=${locale}`),
  });

  return (
    <div className="p-6 space-y-4">
      <LanguageSwitcher
        locale={locale}
        setLocale={(value) => setLocale(value as "en" | "hi" | "mr")}
      />

      <DataTable
        columns={columns}
        data={data}
        filterKeys={["title"]}
      />
    </div>
  );
}
