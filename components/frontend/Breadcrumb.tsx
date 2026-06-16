"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function formatLabel(value: string) {
  return decodeURIComponent(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const pathArr = pathname.split("/").filter(Boolean);

  if (pathArr.length === 0) return <></>;

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol
        className="
          inline-flex flex-wrap items-center gap-1 rounded-2xl
          border border-white/10 bg-white/10 px-4 py-2
          shadow-sm backdrop-blur-xl
        "
      >
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="
              inline-flex items-center gap-2 rounded-2xl px-2 py-1
              text-sm font-medium text-muted-foreground
              transition-all hover:bg-white/10 hover:text-primary
            "
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </li>

        {pathArr.map((item, i) => {
          const href = "/" + pathArr.slice(0, i + 1).join("/");
          const isLast = i === pathArr.length - 1;

          return (
            <li key={href} className="inline-flex items-center">
              <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground/60" />

              {isLast ? (
                <span
                  className="
                    rounded-2xl bg-gradient-to-r from-orange-500/20
                    via-blue-500/20 to-purple-500/20 px-3 py-1
                    text-sm font-semibold text-foreground
                  "
                >
                  {formatLabel(item)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="
                    rounded-2xl px-2 py-1 text-sm font-medium
                    text-muted-foreground transition-all
                    hover:bg-white/10 hover:text-primary
                  "
                >
                  {formatLabel(item)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
