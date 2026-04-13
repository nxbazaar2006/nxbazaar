"use client";

import Navbar from "@/components/backoffice/Navbar";
import Sidebar from "@/components/backoffice/Sidebar";

import CommandMenu from "@/components/CommandMenu";
import TopLoader from "@/components/TopLoader";

import React, { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
  <div className="flex min-h-screen relative text-gray-900 ">

  {/* 🟣 COLOR OVERLAY (DASHBOARD ONLY) */}
  <div className="
    absolute inset-0 -z-10
    bg-gradient-to-br 
    from-blue-800/80
    via-purple-800/80 
    to-indigo-800/80 
    dark:from-blue-900/20 
    dark:via-purple-900/20 
    dark:to-green-900/20
  " />

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
            pt-24 pr-2 pb-2 flex-1
            transition-all duration-300
            ${sidebarExpanded ? "lg:pl-55" : "pl-20"}
          `}
        >
         
            
              {children}
            
         
        </main>

      </div>
    </div>
  );
}