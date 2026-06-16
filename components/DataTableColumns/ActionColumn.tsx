"use client";

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
  endpoint: string;
  editEndpoint: string;
  onDelete?: (id: string) => void;
}

function normalizeDeleteEndpoint(endpoint: string, id: string) {
  const cleanedEndpoint = endpoint.replace(/^\/+|\/+$/g, "");

  if (cleanedEndpoint.endsWith(`/${id}`)) {
    return `/${cleanedEndpoint}`;
  }

  return `/${cleanedEndpoint}/${id}`;
}

function normalizeEditEndpoint(editEndpoint: string) {
  return editEndpoint.replace(/^\/+/, "");
}

export default function ActionColumn<T extends { id: string }>({
  row,
  title,
  endpoint,
  editEndpoint,
  onDelete,
}: ActionColumnProps<T>) {
  const id = row.original.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 rounded-2xl border bg-card text-card-foreground shadow-sm p-0 text-foreground shadow-sm hover:bg-muted"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-50 min-w-[180px] rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-md animate-in fade-in zoom-in-95"
      >
        <DropdownMenuLabel className="px-2 text-xs font-medium text-muted-foreground">
          Actions
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2 bg-border" />

        <DropdownMenuItem asChild>
          <DeleteBtn
            id={id}
            title={title}
            endpoint={normalizeDeleteEndpoint(endpoint, id)}
            onDelete={(deletedId) => {
              onDelete?.(deletedId);
            }}
          />
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <EditBtn
            title={title}
            editEndpoint={normalizeEditEndpoint(editEndpoint)}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
