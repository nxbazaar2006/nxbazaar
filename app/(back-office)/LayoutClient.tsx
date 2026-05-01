"use client";

import React, { useState } from "react";

import Navbar from "@/components/backoffice/Navbar";
import Sidebar from "@/components/backoffice/Sidebar";
import CommandMenu from "@/components/CommandMenu";
import TopLoader from "@/components/TopLoader";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    // 🔥 YAHI CHANGE HAI (dark-gradient add kiya)
    <div className="dark-gradient flex min-h-screen relative text-white">
      
      {/* GLOBAL */}
      <TopLoader />
      <CommandMenu />

      {/* SIDEBAR */}
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      {/* RIGHT */}
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar setShowSidebar={setShowSidebar} />

        <main
          className={`
            pt-24 pr-6 pb-6 flex-1
            transition-all duration-300
            ${sidebarExpanded ? "lg:pl-64" : "pl-20"}
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}