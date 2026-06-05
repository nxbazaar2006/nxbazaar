"use client";

import { AlignJustify, Bell, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

import { useMounted } from "@/hooks/useMounted";
import { useScroll } from "@/hooks/useScroll";

import logo from "../../public/limiLogo.webp";

import ThemeSwitcherBtn from "../ThemeSwitcherBtn";
import UserAvatar from "./UserAvatar";

type Props = {
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ setShowSidebar }: Props) {
  const { data: session } = useSession();

  const mounted = useMounted();
  const scrolled = useScroll(20);

  return (
    <div
      className={`
        fixed inset-x-0 top-0 z-50
        transition-colors duration-300
        ${scrolled ? "bg-slate-950" : "bg-transparent"}
      `}
    >
      <div
        className="
          mx-auto flex h-20 max-w-7xl items-center justify-between
          gap-4 px-4 lg:px-6
        "
      >
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* SIDEBAR BUTTON */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSidebar((prev) => !prev)}
            className="
              flex h-11 w-11 items-center justify-center
              rounded-2xl
              bg-cyan-500
              text-slate-950
              shadow-lg shadow-cyan-500/20
              transition-all duration-300
              hover:scale-105
              hover:bg-cyan-400
            "
          >
            <AlignJustify className="h-6 w-6" />
          </motion.button>

          {/* LOGO */}
          <Link href="/dashboard" prefetch={false}>
            <Image
              src={logo}
              alt="logo"
              className="w-24 object-contain"
              style={{ height: "auto" }}
            />
          </Link>

          {/* SEARCH */}
          <div
            className="
              hidden lg:flex
              h-12 w-80
              items-center gap-3
              rounded-xl
              bg-white/70
              px-4
              text-slate-500
              shadow-sm
              backdrop-blur-xl
              dark:bg-slate-800/80
              dark:text-slate-400
            "
          >
            <Search className="h-5 w-5" />

            <span className="text-sm">
              Search products, orders...
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* THEME */}
          <div
            className="
              flex h-11 items-center justify-center
            "
          >
            {mounted && <ThemeSwitcherBtn />}
          </div>

          {/* NOTIFICATION */}
          <button
            className="
              relative flex h-11 w-11 items-center justify-center
              rounded-2xl
              bg-amber-500
              text-slate-950
              shadow-lg shadow-amber-500/20
              transition-all duration-300
              hover:scale-105
              hover:bg-amber-400
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

          {/* USER */}
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
      </div>
    </div>
  );
}
