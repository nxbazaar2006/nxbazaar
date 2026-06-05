"use client";

import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "@/redux/slices/languageSlice";
import type { RootState } from "@/redux/store";

const locales = ["en", "hi", "mr"];

export default function LocaleSwitcher() {
  const dispatch = useDispatch();
  const locale = useSelector((state: RootState) => state.language.locale);

  return (
    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => dispatch(setLanguage(l))}
          className={`px-3 py-1 text-sm rounded-lg transition-all ${
            locale === l
              ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
              : "text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
