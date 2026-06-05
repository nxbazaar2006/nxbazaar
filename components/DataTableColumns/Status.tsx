"use client";

import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface SortableColumnProps<TData> {
  column: Column<TData, unknown>;
  title: string;
}

export default function SortableColumn<TData>({
  column,
  title,
}: SortableColumnProps<TData>) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="-ml-3 h-8 px-2"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span>{title}</span>
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}