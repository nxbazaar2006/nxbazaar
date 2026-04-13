"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setLanguage, Locale } from "@/redux/slices/languageSlice";

export default function LanguageSwitcher() {
  const dispatch = useDispatch();
  const locale = useSelector((state: RootState) => state.language.locale);

  const changeLanguage = (lang: Locale) => {
    dispatch(setLanguage(lang));
  };

  return (
    <div className="flex gap-2">
      {["en", "hi", "mr"].map((lang) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang as Locale)}
          className={`px-3 py-1 rounded ${
            locale === lang ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}