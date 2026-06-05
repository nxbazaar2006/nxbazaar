"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  Boxes,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  History,
  HeartHandshake,
  LayoutGrid,
  LayoutList,
  LogOut,
  MonitorPlay,
  Settings,
  ScanSearch,
  Store,
  Truck,
  UserSquare2,
  Users2,
  Warehouse,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Props = {
  showSidebar: boolean;
  setShowSidebar: (value: boolean) => void;
  setSidebarExpanded: (value: boolean) => void;
};

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type SidebarItemProps = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  expanded: boolean;
};

export default function Sidebar({
  showSidebar,
  setShowSidebar,
  setSidebarExpanded,
}: Props) {
  const [openMenu, setOpenMenu] = useState(true);
  const [hovered, setHovered] = useState(false);

  const pathname = usePathname();

  const isExpanded = hovered || showSidebar;

  const catalogueLinks: NavItem[] = [
    { title: "Products", icon: Boxes, href: "/dashboard/products" },
    {
      title: "Categories",
      icon: LayoutList,
      href: "/dashboard/categories",
    },
    { title: "Coupons", icon: ScanSearch, href: "/dashboard/coupons" },
    {
      title: "Store Banners",
      icon: MonitorPlay,
      href: "/dashboard/banners",
    },
    {
      title: "SubCategories",
      icon: LayoutList,
      href: "/dashboard/subcategories",
    },
  ];

  const sidebarLinks: NavItem[] = [
    {
      title: "Product History",
      icon: History,
      href: "/backoffice/product-history",
    },
    { title: "Customers", icon: Users2, href: "/dashboard/customers" },
    { title: "Markets", icon: Warehouse, href: "/dashboard/markets" },
    { title: "Sellers", icon: UserSquare2, href: "/dashboard/sellers" },
    { title: "Orders", icon: Truck, href: "/dashboard/orders" },
    { title: "Sales", icon: Truck, href: "/dashboard/sales" },
    {
      title: "Wallet",
      icon: CircleDollarSign,
      href: "/dashboard/wallet",
    },
    {
      title: "Sellers Support",
      icon: HeartHandshake,
      href: "/dashboard/seller-support",
    },
    { title: "Profile Settings", icon: Settings, href: "/dashboard/profile" },
    { title: "Online Store", icon: ExternalLink, href: "/" },
  ];

  async function handleLogout() {
    await signOut({ redirect: false });
    window.location.assign("/");
  }

  return (
    <>
      {/* MOBILE OVERLAY */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
        />
      )}

      <motion.aside
        onMouseEnter={() => {
          setHovered(true);
          setSidebarExpanded(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
          setSidebarExpanded(false);
        }}
        animate={{ width: isExpanded ? 180 : 56 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={`
          ${showSidebar ? "block" : "hidden"} sm:block
          fixed left-0 top-24 z-35
          h-[calc(100vh-6rem)]
          overflow-y-auto no-scrollbar
        `}
      >
        <div className="p-2 space-y-2">
          {/* DASHBOARD */}
          <SidebarItem
            href="/dashboard"
            icon={LayoutGrid}
            label="Dashboard"
            active={pathname === "/dashboard"}
            expanded={isExpanded}
          />

          {/* CATALOGUE */}
          <Collapsible open={openMenu} onOpenChange={setOpenMenu}>
            <CollapsibleTrigger asChild>
              <div className={`${getSidebarButtonClass(false)} cursor-pointer justify-between`}>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  {isExpanded && <span>Catalogue</span>}
                </div>
                {isExpanded &&
                  (openMenu ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  ))}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="pl-4 space-y-1">
              {catalogueLinks.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.title}
                  active={pathname === item.href}
                  expanded={isExpanded}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* MAIN */}
          {sidebarLinks.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.title}
              active={pathname === item.href}
              expanded={isExpanded}
            />
          ))}

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full"
          >
            <SidebarButton
              icon={LogOut}
              label="Logout"
              active={false}
              expanded={isExpanded}
            />
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function getSidebarButtonClass(active: boolean) {
  const base =
    "flex items-center px-2 py-2 transition-colors duration-200 hover:text-cyan-700 dark:hover:text-cyan-300";

  const state = active
    ? "text-sky-700 dark:text-cyan-200"
    : "text-slate-700 dark:text-slate-300";

  return `${base} ${state}`;
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  expanded,
}: SidebarItemProps) {
  return (
    <Link href={href} prefetch={false}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`
          ${getSidebarButtonClass(active)}
          ${expanded ? "gap-2 px-2" : "justify-center"}
        `}
      >
        <Icon className="w-4 h-4" />
        {expanded && <span>{label}</span>}
      </motion.div>
    </Link>
  );
}

function SidebarButton({
  icon: Icon,
  label,
  active,
  expanded,
}: Omit<SidebarItemProps, "href">) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        ${getSidebarButtonClass(active)}
        ${expanded ? "gap-2 px-2" : "justify-center"}
      `}
    >
      <Icon className="w-4 h-4" />
      {expanded && <span>{label}</span>}
    </motion.div>
  );
}
