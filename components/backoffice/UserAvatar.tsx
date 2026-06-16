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
  Package,
  Store,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { generateInitials } from "@/lib/generateInitials";

type UserType = {
  name?: string | null;
  image?: string | null;
  role?: "USER" | "SELLER" | "ADMIN" | string;
};

type Props = {
  user?: UserType;
  profileHref?: string;
};

export default function UserAvatar({ user, profileHref: profileHrefOverride }: Props) {
  const name = user?.name ?? "";
  const image = user?.image ?? "";
  const role = user?.role ?? "USER";

  const initials = generateInitials(name);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const profileHref =
    profileHrefOverride ??
    (role === "SELLER"
      ? "/dashboard/seller-profile"
      : "/dashboard/profile");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative rounded-full transition hover:scale-105"
        >
          {image ? (
            <Image
              src={image}
              alt={name || "User"}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
              {initials}
            </div>
          )}

          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-green-500 dark:border-slate-950" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="
          w-[270px]
          rounded-2xl
          border border-slate-300
          bg-slate-200
          p-3
          text-slate-950
          shadow-xl shadow-slate-900/20
          dark:border-white/10
          dark:bg-slate-900
          dark:text-white
          dark:shadow-black/40
        "
      >
        {/* Header */}
        <div className="flex items-center gap-3 rounded-2xl p-2">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-700 dark:bg-white/10 dark:text-white">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex flex-col">
            <span className="truncate text-sm font-medium">
              {name || "Guest"}
            </span>
          </div>
        </div>

        {/* Role */}
        <div className="mt-2 px-2">
          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-medium">
            {role}
          </span>
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* Dashboard */}
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-foreground font-medium">Dashboard</span>
          </Link>
        </DropdownMenuItem>

        {/* Profile */}
        <DropdownMenuItem asChild>
          <Link
            href={profileHref}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="text-foreground font-medium">
              {role === "SELLER" ? "Seller Profile" : "Profile Settings"}
            </span>
          </Link>
        </DropdownMenuItem>

        {/* User Orders */}
        {role === "USER" && (
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span className="text-foreground font-medium">My Orders</span>
            </Link>
          </DropdownMenuItem>
        )}

        {/* Seller Menu */}
        {role === "SELLER" && (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/products"
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                <span className="text-foreground font-medium">My Products</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/sales"
                className="flex items-center gap-2"
              >
                <Store className="h-4 w-4" />
                <span className="text-foreground font-medium">Sales</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="my-2" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
