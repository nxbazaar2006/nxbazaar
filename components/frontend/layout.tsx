import Footer from "@/components/frontend/Footer";
import Navbar from "@/components/frontend/Navbar";
import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-20 bg-background" />

      <div
        className="
          fixed inset-0 -z-10
          bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_30%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_35%)]
        "
      />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main
        className="
          mx-auto max-w-7xl
          px-4 py-6
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            rounded-3xl
            border border-white/10
            bg-white/5
            backdrop-blur-xl
            p-4 md:p-6
          "
        >
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}