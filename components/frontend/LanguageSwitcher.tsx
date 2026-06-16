"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setLanguage } from "@/redux/slices/languageSlice";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Locale = "en" | "hi" | "mr";

const languages = [
  { code: "en", label: "🇬🇧 EN" },
  { code: "hi", label: "🇮🇳 हिंदी" },
  { code: "mr", label: "🇮🇳 मराठी" },
] as const;

export default function LanguageSwitcher() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useSelector(
    (state: RootState) => state.language.locale
  );

  const changeLanguage = (lang: Locale) => {
    dispatch(setLanguage(lang));

    const params = new URLSearchParams(searchParams.toString());

    if (lang === "en") {
      params.delete("lang");
    } else {
      params.set("lang", lang);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    router.refresh();
  };

  return (
    <div
      className="
        inline-flex items-center gap-2
        rounded-2xl border border-white/10
        bg-white/10 p-1.5
        backdrop-blur-xl
      "
    >
      {languages.map((lang) => {
        const isActive = locale === lang.code;

        return (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code as Locale)}
            aria-pressed={isActive}
            className={`
              rounded-2xl px-4 py-2
              text-sm font-medium
              transition-all duration-300
              hover:scale-105
              ${
                isActive
                  ? `
                    bg-gradient-to-r
                    from-orange-500
                    via-pink-500
                    to-purple-500
                    text-white
                    shadow-lg
                  `
                  : `
                    text-foreground
                    hover:bg-white/10
                  `
              }
            `}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
