"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getSafeTranslation } from "@/lib/getTranslation";

interface Props {
  data: Array<{
    id: string;
    translations?: Array<{
      locale: string;
      title?: string | null;
    }>;
  }>;
  type: "category" | "product" | "market";
}

export default function CatalogWrapper({ data }: Props) {
  const locale = useSelector(
    (state: RootState) => state.language.locale
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => {
        const t = getSafeTranslation(item.translations ?? [], locale);

        return (
          <div
            key={item.id}
            className="
              group relative overflow-hidden
              rounded-2xl border border-white/10
              bg-white/10 p-5
              backdrop-blur-xl
              shadow-sm
              transition-all duration-300
              hover:-translate-y-1
              hover:border-white/20
              hover:bg-gradient-to-br
              hover:from-orange-500/10
              hover:via-blue-500/10
              hover:to-purple-500/10
              hover:shadow-xl
            "
          >
            {/* Glow Effect */}
            <div
              className="
                absolute inset-0 opacity-0
                transition-opacity duration-300
                group-hover:opacity-100
                bg-gradient-to-br
                from-orange-500/5
                via-pink-500/5
                to-purple-500/5
              "
            />

            <div className="relative z-10">
              <h3 className="text-base font-semibold tracking-tight">
                {t?.title ?? "Untitled"}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {locale.toUpperCase()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
