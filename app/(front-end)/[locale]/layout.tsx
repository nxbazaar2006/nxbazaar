"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLanguage } from "@/redux/slices/languageSlice";
import { getCurrentLocale } from "@/lib/i18n";
import Providers from "@/context/Providers";
export default function FrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    const locale = getCurrentLocale(pathname);
    dispatch(setLanguage(locale));
  }, [pathname, dispatch]);

  return <> <Providers>{children}</Providers></>;
}