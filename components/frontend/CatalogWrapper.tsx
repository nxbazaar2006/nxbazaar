"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getSafeTranslation } from "@/lib/getTranslation";

interface Props {
  data: any[];
  type: "category" | "product" | "market";
}

export default function CatalogWrapper({ data }: Props) {
  const locale = useSelector((state: RootState) => state.language.locale);

  return (
    <div className="grid gap-4">
      {data.map((item) => {
        const t = getSafeTranslation(item.translations, locale);

        return (
          <div key={item.id} className="border p-3 rounded">
            {t?.name}
          </div>
        );
      })}
    </div>
  );
}