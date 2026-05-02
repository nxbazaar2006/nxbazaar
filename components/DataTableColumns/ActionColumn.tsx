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
import { MoreHorizontal } from "lucide-react";
import DeleteBtn from "../Actions/DeleteBtn";
import EditBtn from "../Actions/EditBtn";

interface ActionColumnProps<T extends { id: string }> {
  row: Row<T>;
  title: string;
  endpoint: string; // base endpoint (e.g. "/categories")
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
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 rounded-md hover:bg-white/10 transition"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4 text-white/80" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="relative z-50 min-w-[180px] bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-xl animate-in fade-in zoom-in-95"
        >
          <DropdownMenuLabel className="text-white/70">
            Actions
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-white/20" />

          {/* 🔴 Delete */}
          <DropdownMenuItem asChild>
            <DeleteBtn
              id={id}
              title={title}
              endpoint={`${endpoint}/${id}`} // ✅ FIXED
              onDelete={(deletedId) => {
                const table = (row as Row<T> & {
                  table?: {
                    options?: {
                      meta?: {
                        removeRow?: (id: string) => void;
                      };
                    };
                  };
                }).table;

                table?.options?.meta?.removeRow?.(deletedId);
              }}
            />
          </DropdownMenuItem>

          {/* ✏️ Edit */}
          <DropdownMenuItem asChild>
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
