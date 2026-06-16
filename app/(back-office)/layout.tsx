"use client";

import Navbar from "@/components/backoffice/Navbar";
import Sidebar from "@/components/backoffice/Sidebar";
import React, { useState } from "react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const contentExpanded = showSidebar || sidebarExpanded;

  return (
    <div className="relative flex min-h-screen overflow-hidden text-foreground">
      {/* SIDEBAR */}
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        setSidebarExpanded={setSidebarExpanded}
      />

      {/* RIGHT */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* NAVBAR */}
        <Navbar setShowSidebar={setShowSidebar} />

        {/* CONTENT */}
        <main
          className={`
            min-h-screen min-w-0 flex-1
            px-3 pb-4 pt-20
            transition-all duration-300 ease-in-out
            sm:px-5
            ${contentExpanded ? "sm:pl-[196px]" : "sm:pl-20"}
          `}
        >
          <section
            className="
              min-h-[calc(100vh-7rem)]
              min-w-0
              rounded-2xl
              p-2 sm:p-4
            "
          >
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
