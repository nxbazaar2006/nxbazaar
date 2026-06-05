"use client";

import React, { useEffect, useState } from "react";
import SearchForm from "./SearchForm";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/limiLogo.webp";
import { Menu, User, X } from "lucide-react";
import ThemeSwitcherBtn from "../ThemeSwitcherBtn";
import HelpModal from "./HelpModal";
import CartCount from "./CartCount";
import DeliverToButton from "@/components/location/DeliverToButton";
import { useSession } from "next-auth/react";
import UserAvatar from "../backoffice/UserAvatar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { setLanguage } from "@/redux/slices/languageSlice";
import { useScroll } from "@/hooks/useScroll";

type NavbarProps = {
  className?: string;
};

type Locale = "en" | "hi" | "mr";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Blogs", href: "/blogs" },
  { label: "Vlog", href: "/vlogs" },
];

const navLinkClass =
  "rounded-2xl px-4 py-2 text-sm font-medium text-slate-950 transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-orange-500/15 hover:via-pink-500/15 hover:to-purple-500/15 dark:text-white";

const mobileLinkClass =
  "rounded-2xl px-4 py-3 text-sm font-medium text-slate-950 transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-500/15 hover:via-pink-500/15 hover:to-purple-500/15 dark:text-white";

const glassButtonClass =
  "apple-glass-soft rounded-2xl text-slate-950 transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-orange-500/15 hover:via-pink-500/15 hover:to-purple-500/15 dark:text-white";

export default function Navbar({ className = "" }: NavbarProps) {
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const scrolled = useScroll(20);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const selectedLocale = searchParams.get("lang");

  const locale: Locale =
    selectedLocale === "hi" || selectedLocale === "mr"
      ? selectedLocale
      : "en";

  useEffect(() => {
    dispatch(setLanguage(locale));
  }, [dispatch, locale]);

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
    setOpen(false);
  };

  if (status === "loading") {
    return (
      <div
        className="
          fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-center
          border-b border-white/10 text-sm text-slate-950 dark:text-white
        "
      >
        Loading...
      </div>
    );
  }

  return (
    <>
      <header
        className={cn(
          `
          fixed inset-x-0 top-0 z-50
          frontend-navbar border-b border-white/10
          text-slate-950 dark:text-white
          shadow-[0_14px_36px_rgba(2,6,23,0.32)]
          transition-colors duration-300
          `,
          scrolled ? "bg-white/90 backdrop-blur-xl dark:bg-slate-950" : "bg-transparent",
          className
        )}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
          <Link href="/" className="flex shrink-0 items-center">
            <Image src={logo} alt="NXBazaar logo" width={110} height={40} priority />
          </Link>

          <div className="flex min-w-0 flex-1 md:max-w-md lg:max-w-lg">
            <SearchForm />
          </div>

          <nav className="hidden shrink-0 items-center gap-1 md:flex">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <DeliverToButton iconOnly />

            <select
              value={locale}
              onChange={(e) => changeLanguage(e.target.value as Locale)}
              aria-label="Select language"
              className="
                apple-glass-soft h-11 rounded-2xl
                px-3 py-2 text-sm text-slate-950 dark:text-white
                shadow-sm outline-none backdrop-blur-xl
                transition-all duration-300
                hover:bg-white/75 dark:hover:bg-white/15
                focus:border-orange-500/40
                focus:ring-2 focus:ring-orange-500/20
              "
            >
              <option className="bg-slate-950 text-white" value="en">
                EN
              </option>
              <option className="bg-slate-950 text-white" value="hi">
                HI
              </option>
              <option className="bg-slate-950 text-white" value="mr">
                MR
              </option>
            </select>

            {status === "unauthenticated" ? (
              <Link
                href="/login"
                className={cn(
                  glassButtonClass,
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium"
                )}
              >
                <User size={18} />
                Login
              </Link>
            ) : (
              <UserAvatar user={session?.user} />
            )}

            <HelpModal />
            <CartCount />
            <ThemeSwitcherBtn />
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
              className={cn(glassButtonClass, "flex h-11 w-11 items-center justify-center md:hidden")}
          >
            <Menu />
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-300 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        <aside
          className={cn(
            `
            absolute left-0 top-0 h-full w-80 max-w-[85vw]
            border-r border-white/10
            frontend-navbar bg-slate-950 text-white
            shadow-2xl
            transition-transform duration-300
            `,
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center"
            >
              <Image src={logo} alt="NXBazaar logo" width={105} height={38} />
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className={cn(glassButtonClass, "p-2")}
            >
              <X />
            </button>
          </div>

          <div className="flex flex-col gap-3 p-4">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={mobileLinkClass}
              >
                {item.label}
              </Link>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
              <DeliverToButton iconOnly />
            </div>

            <select
              value={locale}
              onChange={(e) => changeLanguage(e.target.value as Locale)}
              aria-label="Select language"
              className="
                rounded-2xl border border-white/10 bg-slate-900
                px-4 py-3 text-sm text-white
                shadow-sm outline-none backdrop-blur-xl
                focus:border-orange-500/40
                focus:ring-2 focus:ring-orange-500/20
              "
            >
              <option className="bg-slate-950 text-white" value="en">
                EN
              </option>
              <option className="bg-slate-950 text-white" value="hi">
                HI
              </option>
              <option className="bg-slate-950 text-white" value="mr">
                MR
              </option>
            </select>

            {status === "unauthenticated" ? (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={cn(
                  glassButtonClass,
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium"
                )}
              >
                <User size={18} />
                Login
              </Link>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
                <UserAvatar user={session?.user} />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
                <HelpModal />
              </div>

              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
                <CartCount />
              </div>

              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
                <ThemeSwitcherBtn />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
