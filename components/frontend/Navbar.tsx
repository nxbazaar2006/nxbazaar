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
import { useSession } from "next-auth/react";
import UserAvatar from "../backoffice/UserAvatar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type NavbarProps = {
  className?: string;
};

type Locale = "en" | "hi" | "mr";

export default function Navbar({ className = "" }: NavbarProps) {
  const { data: session, status } = useSession();

  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");

  const pathname = usePathname();
  const router = useRouter();

  /* SCROLL */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* LANGUAGE */
  const changeLanguage = (lang: Locale) => {
    setLocale(lang);
    const url = `${pathname}?lang=${lang}`;
    router.push(url);
  };

  if (status === "loading") {
    return (
      <div className="h-16 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300",
          isScrolled
            ? "h-16 bg-white/70 dark:bg-black/60 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-sm"
            : "h-20 bg-transparent",
          className
        )}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 lg:px-8 h-full gap-4">

          {/* LOGO */}
          <Link href="/" className="flex-shrink-0">
            <Image src={logo} alt="logo" width={110} height={40} priority />
          </Link>

          {/* SEARCH */}
          <div className="hidden md:flex flex-grow">
            <SearchForm />
          </div>

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center gap-6 font-medium text-gray-800 dark:text-white">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Home
            </Link>
            <Link href="/products" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Products
            </Link>
            <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Blogs
            </Link>
          </div>

          {/* RIGHT */}
          <div className="hidden md:flex items-center gap-4">

            {/* LANGUAGE */}
            <select
              value={locale}
              onChange={(e) =>
                changeLanguage(e.target.value as Locale)
              }
              className="
                bg-white dark:bg-black
                text-gray-800 dark:text-white
                border border-gray-200 dark:border-white/10
                rounded-lg px-2 py-1 text-sm shadow-sm
              "
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="mr">MR</option>
            </select>

            {/* USER */}
            {status === "unauthenticated" ? (
              <Link
                href="/login"
                className="
                  flex items-center gap-1 px-3 py-2 rounded-lg
                  text-gray-800 dark:text-white
                  hover:bg-gray-100 dark:hover:bg-white/10
                  transition
                "
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

          {/* MOBILE BTN */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-white"
          >
            <Menu />
          </button>
        </div>

        {/* MOBILE SEARCH */}
        <div className="md:hidden px-4 pb-2">
          <SearchForm />
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        {/* overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* drawer */}
        <div
          className={cn(
            "absolute top-0 left-0 h-full w-72 transition-transform duration-300",
            "bg-white dark:bg-black text-gray-800 dark:text-white",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4 flex justify-between border-b border-gray-200 dark:border-white/10">
            <h2 className="font-semibold">Menu</h2>
            <button onClick={() => setOpen(false)}>
              <X />
            </button>
          </div>

          <div className="flex flex-col gap-4 p-4">

            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/products" onClick={() => setOpen(false)}>Products</Link>
            <Link href="/blog" onClick={() => setOpen(false)}>Blogs</Link>

            <select
              value={locale}
              onChange={(e) =>
                changeLanguage(e.target.value as Locale)
              }
              className="
                bg-white dark:bg-black
                border border-gray-200 dark:border-white/10
                px-3 py-2 rounded
              "
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="mr">MR</option>
            </select>

            {status === "unauthenticated" ? (
              <Link href="/login">Login</Link>
            ) : (
              <UserAvatar user={session?.user} />
            )}

            <HelpModal />
            <CartCount />
            <ThemeSwitcherBtn />
          </div>
        </div>
      </div>
    </>
  );
}