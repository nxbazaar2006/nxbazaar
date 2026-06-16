"use client";

import React, { useState } from "react";
import Link from "next/link";

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
  featured?: boolean;
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
    { title: "Seller Profile", icon: Store, href: "/dashboard/seller-profile" },
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
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-3xl sm:hidden"
        />
      )}

      <aside
        onMouseEnter={() => {
          setHovered(true);
          setSidebarExpanded(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
          setSidebarExpanded(false);
        }}
        className={`
          ${showSidebar ? "block" : "hidden"} sm:block
          fixed left-3 top-24 z-35
          h-[calc(100vh-7rem)]
          overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
          glass-sidebar transition-[width] duration-300
          p-1.5
          ${isExpanded ? "w-[180px]" : "w-14"}
        `}
      >
        <div className="space-y-2 p-1">
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
                  <Store className="h-3.5 w-3.5" />
                  {isExpanded && <SidebarLabel label="Catalogue" />}
                </div>
                {isExpanded &&
                  (openMenu ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ))}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-2 pl-4 pt-2">
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
      </aside>
    </>
  );
}

function getSidebarButtonClass(active: boolean, featured = false) {
  const base =
    "flex items-center rounded-2xl text-sm text-foreground/80 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/30";
  const size = active || featured ? "px-2 py-1.5" : "px-2.5 py-2";

  const state = featured
    ? "bg-white/20 font-semibold text-foreground shadow-sm"
    : active
    ? "bg-white/20 font-semibold text-foreground shadow-sm"
    : "font-medium hover:-translate-y-0.5 hover:bg-white/20 hover:text-foreground";

  return `${base} ${size} ${state}`;
}

function SidebarLabel({
  label,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <span className="text-foreground font-medium">
      {label}
    </span>
  );
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  expanded,
  featured,
}: SidebarItemProps) {
  return (
    <Link href={href} prefetch={false}>
      <div
        className={`
          ${getSidebarButtonClass(active, featured)}
          ${expanded ? "gap-2" : "justify-center"}
        `}
        >
        <Icon className={active || featured ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {expanded && <SidebarLabel label={label} active={active || featured} />}
      </div>
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
    <div
      className={`
        ${getSidebarButtonClass(active)}
        ${expanded ? "gap-2" : "justify-center"}
      `}
    >
      <Icon className="h-4 w-4" />
      {expanded && <SidebarLabel label={label} active={active} />}
    </div>
  );
}
