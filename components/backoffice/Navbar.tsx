"use client";

import { AlignJustify, Bell } from "lucide-react";
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
    <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div
        className={`
          h-20 px-6 flex items-center justify-between
          border-b transition-all duration-300

          ${
            scrolled
              ? "backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-white/20 dark:border-slate-700 shadow-md"
              : "bg-transparent border-transparent"
          }
        `}
      >
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSidebar((prev) => !prev)}
            className="
              p-2 rounded-lg
              hover:bg-white/20 dark:hover:bg-slate-800
              transition
            "
          >
            <AlignJustify className="w-5 h-5" />
          </motion.button>

          <Link href="/dashboard">
            <Image src={logo} alt="logo" className="w-24" />
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center">
            {mounted && <ThemeSwitcherBtn />}
          </div>

          {/* Notification */}
          <button className="relative p-2 rounded-lg hover:bg-white/20 dark:hover:bg-slate-800 transition">
            <Bell className="w-5 h-5" />
            <span className="
              absolute -top-1 -right-1
              min-w-[16px] h-4 px-1
              text-[10px]
              flex items-center justify-center
              bg-indigo-500 text-white
              rounded-full
            ">
              3
            </span>
          </button>

          {session?.user && <UserAvatar user={session.user} />}
        </div>
      </div>
    </div>
  );
}