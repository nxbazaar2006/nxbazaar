"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { generateInitials } from "@/lib/generateInitials";
import { motion } from "framer-motion";

/* ================= TYPES ================= */

type UserType = {
  name?: string | null;
  image?: string | null;
  email?: string | null;
  role?: "USER" | "ADMIN" | string;
};

type Props = {
  user?: UserType;
};

/* ================= COMPONENT ================= */

export default function UserAvatar({ user }: Props) {
  const name = user?.name ?? "";
  const email = user?.email ?? "";
  const image = user?.image ?? "";
  const role = user?.role ?? "USER";

  const initials = generateInitials(name);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <DropdownMenu>
      {/* 🔥 TRIGGER */}
      <DropdownMenuTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative rounded-full hover:scale-105 transition"
        >
          {image ? (
            <Image
              src={image}
              alt={name || "User"}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white text-sm border border-white/10">
              {initials}
            </div>
          )}

          {/* 🟢 ONLINE DOT */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black" />
        </motion.button>
      </DropdownMenuTrigger>

      {/* 🔥 PRO CARD */}
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="
          w-[260px]
          bg-popover shadow-sm
          border border-white/10
          rounded-2xl
          p-3
          animate-in fade-in zoom-in-95
        "
      >
        {/* 👤 HEADER */}
        <div className="flex items-center gap-3 p-2 rounded-xl">

          {image ? (
            <Image
              src={image}
              alt={name}
              width={44}
              height={44}
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white text-sm">
              {initials}
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-sm font-medium truncate">
              {name || "Guest"}
            </span>
            <span className="text-xs text-white/60 truncate">
              {email || "No email"}
            </span>
          </div>
        </div>

        {/* ROLE BADGE */}
        <div className="px-2 mt-1">
          <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10">
            {role}
          </span>
        </div>

        <DropdownMenuSeparator className="bg-white/10 my-2" />

        {/* MENU */}
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            Profile Settings
          </Link>
        </DropdownMenuItem>

        {role === "USER" && (
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent"
            >
              <User className="h-4 w-4" />
              My Orders
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-white/10 my-2" />

        {/* LOGOUT */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="
            flex items-center gap-2 px-2 py-2
            rounded-md text-red-400
            hover:bg-red-500/10 transition cursor-pointer
          "
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
