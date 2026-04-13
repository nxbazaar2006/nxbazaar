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
  HeartHandshake,
  LayoutGrid,
  LayoutList,
  LogOut,
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

import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();

  const isExpanded = hovered;

  const catalogueLinks: NavItem[] = [
    { title: "Products", icon: Boxes, href: "/dashboard/products" },
    { title: "Categories", icon: LayoutList, href: "/dashboard/categories" },
    {
      title: "SubCategories",
      icon: LayoutList,
      href: "/dashboard/subcategories",
    },
  ];

  const sidebarLinks: NavItem[] = [
    { title: "Customers", icon: Users2, href: "/dashboard/customers" },
    { title: "Markets", icon: Warehouse, href: "/dashboard/markets" },
    { title: "Sellers", icon: UserSquare2, href: "/dashboard/sellers" },
    { title: "Orders", icon: Truck, href: "/dashboard/orders" },
    { title: "Sales", icon: Truck, href: "/dashboard/sales" },
    { title: "Wallet", icon: CircleDollarSign, href: "/dashboard/wallet" },
    {
      title: "Sellers Support",
      icon: HeartHandshake,
      href: "/dashboard/seller-support",
    },
    { title: "Settings", icon: LayoutGrid, href: "/dashboard/settings" },
    { title: "Online Store", icon: ExternalLink, href: "/" },
  ];

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/");
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
        animate={{ width: isExpanded ? 200 : 65 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={`
          ${showSidebar ? "block" : "hidden"} sm:block
          fixed top-14 left-0 z-40
          h-[calc(100vh-3rem)]

          backdrop-blur-2xl bg-white/5
          border border-white/10
          shadow-[0_10px_40px_rgba(0,0,0,0.4)]

          rounded-2xl
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
              <div className="flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer hover:bg-white/10">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  {isExpanded && <span>Catalogue</span>}
                </div>
                {isExpanded &&
                  (openMenu ? <ChevronDown /> : <ChevronRight />)}
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
          <button onClick={handleLogout}>
            <SidebarItem
              href="#"
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

function SidebarItem({ href, icon: Icon, label, active, expanded }: SidebarItemProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.04 }}
        className={`
          flex items-center
          ${expanded ? "gap-2 px-2" : "justify-center"}
          py-2 rounded-lg

          transition-all duration-200

          ${
            active
              ? "bg-white/10 border-l-2 border-white text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }
        `}
      >
        <Icon className="w-4 h-4" />
        {expanded && <span>{label}</span>}
      </motion.div>
    </Link>
  );
}
