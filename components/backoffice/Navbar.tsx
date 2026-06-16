"use client";

import { AlignJustify, Bell, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { useMounted } from "@/hooks/useMounted";

import logo from "../../public/limiLogo.webp";

import ThemeSwitcherBtn from "../ThemeSwitcherBtn";
import UserAvatar from "./UserAvatar";

type Props = {
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ setShowSidebar }: Props) {
  const { data: session } = useSession();

  const mounted = useMounted();

  return (
    <nav
      className="
        fixed left-1 right-1 top-0 z-20 mx-auto
        flex h-18 items-center justify-between
        liquid-glass-nav glass-navbar gap-4 rounded-full px-2 backdrop-blur-2xl
        lg:left-2 lg:right-2 lg:px-10
      "
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setShowSidebar((prev) => !prev)}
          className="
            soft-button soft-icon-btn
          "
        >
          <AlignJustify className="h-6 w-6" />
        </button>

        <Link href="/dashboard" prefetch={false}>
          <Image
            src={logo}
            alt="logo"
            className="w-24 object-contain"
            style={{ height: "auto" }}
          />
        </Link>

        <div
          className="
            inset-input hidden h-12 w-96
            items-center gap-3 px-4
            lg:flex
          "
        >
          <Search className="h-5 w-5" />

          <span className="text-sm font-medium text-muted-foreground">
            Search 
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="
            flex h-11 items-center justify-center
          "
        >
          {mounted && <ThemeSwitcherBtn />}
        </div>

        <button
          className="
            soft-button soft-icon-btn relative
          "
        >
          <Bell className="h-6 w-6" />

          <span
            className="
              absolute -right-1 -top-1
              flex h-5 min-w-[20px]
              items-center justify-center
              rounded-full
              bg-rose-500
              px-1
              text-[10px]
              font-bold text-white
              ring-2 ring-white dark:ring-[#0B1120]
            "
          >
            3
          </span>
        </button>

        {session?.user && (
          <div
            className="
              rounded-2xl
              p-1
              bg-transparent
            "
          >
            <UserAvatar user={session.user} />
          </div>
        )}
      </div>
    </nav>
  );
}
