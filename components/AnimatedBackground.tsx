"use client";

import * as React from "react";
import { Command } from "cmdk";

export default function CommandMenu() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Command className="bg-zinc-900 text-white rounded-xl w-[500px] p-4">
        <Command.Input placeholder="Search..." className="mb-3 bg-transparent outline-none" />
        <Command.List>
          <Command.Item onSelect={() => window.location.assign("/dashboard")}>Dashboard</Command.Item>
          <Command.Item onSelect={() => window.location.assign("/dashboard/products")}>Products</Command.Item>
        </Command.List>
      </Command>
    </Command.Dialog>
  );
}
