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
  <div className="flex min-h-screen relative ">

  {/* 🟣 COLOR OVERLAY (DASHBOARD ONLY) */}
  <div className="
    absolute inset-0 -z-10
   
    
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