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
import { getFrontendText } from "@/lib/frontendI18n";
import { useScroll } from "@/hooks/useScroll";

type NavbarProps = {
  className?: string;
};

type Locale = "en" | "hi" | "mr";

const navLinks = [
  { labelKey: "home", href: "/" },
  { labelKey: "products", href: "/products" },
  { labelKey: "blogs", href: "/blogs" },
  { labelKey: "vlog", href: "/vlogs" },
] as const;

const navLinkClass =
  "rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-all duration-300 hover:bg-white/20 hover:text-foreground";

const mobileLinkClass =
  "rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 transition-all duration-300 hover:bg-white/20 hover:text-foreground";

const glassButtonClass =
  "soft-button text-foreground";

export default function Navbar({ className = "" }: NavbarProps) {
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const scrolled = useScroll(20);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const selectedLocale = searchParams.get("lang");
  const pathLocale = pathname.split("/")[1];

  const locale: Locale =
    selectedLocale === "hi" || selectedLocale === "mr"
      ? selectedLocale
      : pathLocale === "hi" || pathLocale === "mr"
      ? pathLocale
      : "en";
  const text = getFrontendText(locale);

  const localizedHref = (href: string) => {
    if (locale === "en") return href;

    const separator = href.includes("?") ? "&" : "?";
    return `${href}${separator}lang=${locale}`;
  };

  useEffect(() => {
    dispatch(setLanguage(locale));
  }, [dispatch, locale]);

  const changeLanguage = (lang: Locale) => {
    dispatch(setLanguage(lang));

    const params = new URLSearchParams(searchParams.toString());
    const segments = pathname.split("/");
    const hasLocalePrefix = segments[1] === "hi" || segments[1] === "mr";
    let nextPath = pathname;

    if (hasLocalePrefix) {
      const pathWithoutLocale = `/${segments.slice(2).join("/")}`;
      nextPath = lang === "en" ? pathWithoutLocale : `/${lang}${pathWithoutLocale}`;
    }

    if (lang === "en") {
      params.delete("lang");
    } else {
      params.set("lang", lang);
    }

    const query = params.toString();
    router.push(query ? `${nextPath}?${query}` : nextPath);
    router.refresh();
    setOpen(false);
  };

  if (status === "loading") {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          `
          fixed inset-x-0 top-0 z-50
          text-foreground
          p-3 transition-colors duration-300
          `,
          scrolled ? "backdrop-blur-xl" : "bg-transparent",
          className
        )}
      >
        <div
          className={cn(
            "liquid-glass-nav raised-panel mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 rounded-full px-4 transition-all duration-300 sm:h-[4.5rem] sm:px-4 lg:px-5",
            scrolled ? "shadow-[0_20px_60px_rgba(0,0,0,0.25)]" : "shadow-[0_12px_36px_rgba(0,0,0,0.16)]"
          )}
        >
          <Link href="/" className="flex shrink-0 items-center">
            <Image src={logo} alt="NXBazaar logo" width={110} height={40} priority />
          </Link>

          <div className="flex min-w-0 flex-1 md:max-w-md lg:max-w-lg">
            <SearchForm />
          </div>

          <nav className="hidden shrink-0 items-center gap-1 md:flex">
            {navLinks.map((item) => (
              <Link key={item.href} href={localizedHref(item.href)} className={navLinkClass}>
                {text.nav[item.labelKey]}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <DeliverToButton iconOnly />

            <select
              value={locale}
              onChange={(e) => changeLanguage(e.target.value as Locale)}
              aria-label="Select language"
              className="
                inset-input h-11 px-3 py-2 text-sm
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
                {text.nav.login}
              </Link>
            ) : (
              <UserAvatar user={session?.user} profileHref={localizedHref("/profile")} />
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
            neumorphic-card absolute left-0 top-0 h-full w-80 max-w-[85vw]
            rounded-l-none rounded-r-3xl
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
                href={localizedHref(item.href)}
                onClick={() => setOpen(false)}
                className={mobileLinkClass}
              >
                {text.nav[item.labelKey]}
              </Link>
            ))}

            <div className="neumorphic-card p-3">
              <DeliverToButton iconOnly />
            </div>

            <select
              value={locale}
              onChange={(e) => changeLanguage(e.target.value as Locale)}
              aria-label="Select language"
              className="
                inset-input rounded-2xl px-4 py-3 text-sm
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
                {text.nav.login}
              </Link>
            ) : (
              <div className="neumorphic-card p-3">
                <UserAvatar user={session?.user} profileHref={localizedHref("/profile")} />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="neumorphic-card flex items-center justify-center p-3">
                <HelpModal />
              </div>

              <div className="neumorphic-card flex items-center justify-center p-3">
                <CartCount />
              </div>

              <div className="neumorphic-card flex items-center justify-center p-3">
                <ThemeSwitcherBtn />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
