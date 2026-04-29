"use client";

import React from "react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import DeleteBtn from "../Actions/DeleteBtn";
import EditBtn from "../Actions/EditBtn";

interface ActionColumnProps<T extends { id: string }> {
  row: Row<T>;
  title: string;
  endpoint: string;
  editEndpoint: string;
}

export default function ActionColumn<T extends { id: string }>({
  row,
  title,
  endpoint,
  editEndpoint,
}: ActionColumnProps<T>) {
  const id = row.original.id;

  return (
    <div className="relative">
      <DropdownMenu>
        {/* 🔥 Trigger */}
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="
              h-8 w-8 p-0 
              rounded-md
              hover:bg-white/10 
              transition
            "
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4 text-white/80" />
          </Button>
        </DropdownMenuTrigger>

        {/* 🔥 Glass Dropdown */}
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="
            relative
            z-50 min-w-[180px]

            /* 🌫️ Glass */
            bg-white/10 backdrop-blur-xl

            /* 🌈 Border */
            border border-white/20

            /* 🎨 Text */
            text-white

            /* 💎 Depth */
            shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]

            /* 🧊 Shape */
            rounded-xl

            /* ✨ Animation */
            animate-in fade-in zoom-in-95

            /* 🌟 Light Reflection */
            before:absolute before:inset-0
            before:rounded-xl
            before:bg-gradient-to-br
            before:from-white/20 before:to-transparent
            before:opacity-30
            before:pointer-events-none
          "
        >
          <DropdownMenuLabel className="text-white/70">
            Actions
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-white/20" />

          {/* 🔴 Delete */}
          <DropdownMenuItem
            className="
              flex items-center gap-2 
              hover:bg-red-500/30 
              rounded-md transition
            "
          >
            <Trash className="h-4 w-4 text-red-400" />
            <DeleteBtn
              id={id}
              title={title}
              endpoint={endpoint}
            />
          </DropdownMenuItem>

          {/* ✏️ Edit */}
          <DropdownMenuItem
            className="
              flex items-center gap-2 
              hover:bg-white/20 
              rounded-md transition
            "
          >
            <Pencil className="h-4 w-4 text-white/80" />
            <EditBtn
              title={title}
              editEndpoint={editEndpoint}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}