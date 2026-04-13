"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <div
      className={`
        fixed top-0 left-0 h-[3px] z-[999]
        bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500
        transition-all duration-500
        ${loading ? "w-full opacity-100" : "w-0 opacity-0"}
      `}
    />
  );
}