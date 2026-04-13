"use client";

import { useDispatch, useSelector } from "react-redux";
import { setLocale } from "@/redux/slices/localeSlice";

const locales = ["en", "hi", "mr"];

export default function LocaleSwitcher() {
  const dispatch = useDispatch();
  const locale = useSelector((state: any) => state.locale.locale);

  return (
    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => dispatch(setLocale(l))}
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