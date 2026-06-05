"use client";

import Navbar from "@/components/backoffice/Navbar";
import Sidebar from "@/components/backoffice/Sidebar";
import React, { useEffect, useState } from "react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const contentExpanded = showSidebar || sidebarExpanded;

  useEffect(() => {
    const previousClassName = document.body.className;

    document.body.className = `${previousClassName} backoffice-plain-bg`;

    return () => {
      document.body.className = previousClassName;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-transparent text-slate-950 dark:text-white">
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
    px-2 pb-2 pt-20
    transition-all duration-300 ease-in-out
    ${contentExpanded ? "sm:pl-[188px]" : "sm:pl-16"}
  `}
>
          <section
            className="
              min-h-[calc(100vh-7rem)]
              min-w-0
              rounded-[32px]
              p-4
            "
          >
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
