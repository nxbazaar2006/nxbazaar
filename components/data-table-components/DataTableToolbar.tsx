"use client";

import type { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

import { useApiBulkDelete } from "@/lib/apiRequest";
import { getErrorMessage } from "@/lib/error-message";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type BulkDeleteResponse = {
  message?: string;
  data?: {
    deletedIds?: string[];
    blockedIds?: string[];
  };
};

interface DataTableToolbarProps<TData extends { id: string }> {
  table: Table<TData>;
  endpoint?: string;
  queryKey?: readonly unknown[];
  filterKeys?: (keyof TData)[];
  onDeleteSuccess?: (ids: string[]) => void;
}

export function DataTableToolbar<TData extends { id: string }>({
  table,
  endpoint,
  onDeleteSuccess,
}: DataTableToolbarProps<TData>) {
  "use no memo";

  const bulkDelete = useApiBulkDelete();
  const ids = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id);

  const handleBulkDelete = async () => {
    if (!endpoint) {
      toast.error("Delete endpoint missing");
      return;
    }

    if (ids.length === 0) {
      toast.error("Please select at least one row");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${ids.length} selected item(s)?`
    );

    if (!confirmed) return;

    try {
      const result = (await bulkDelete.mutateAsync({
        endpoint,
        ids,
      })) as BulkDeleteResponse;
      const deletedIds = result.data?.deletedIds ?? ids;

      table.resetRowSelection();

      onDeleteSuccess?.(deletedIds);

      toast.success(result.message || "Deleted successfully");
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (error as ApiError).response?.data?.message
          : undefined;

      toast.error(
        apiMessage ||
          getErrorMessage(
            error,
            "Failed to delete items"
          )
      );
    }
  };

  // Hide toolbar completely when nothing is selected
  if (!endpoint || ids.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-end">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleBulkDelete}
        disabled={bulkDelete.isPending}
        className="
          rounded-2xl
          shadow-sm
          transition-all
          disabled:opacity-50
        "
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {bulkDelete.isPending
          ? "Deleting..."
          : `Delete Selected (${ids.length})`}
      </Button>
    </div>
  );
}
