"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import toast from "react-hot-toast";

interface DataTableProps<TData extends { id: string }> {
  columns: ColumnDef<TData>[];
  data: TData[];
  endpoint?: string;
  queryKey?: readonly unknown[];
  filterKeys?: string[];
  isLoading?: boolean;

  onDeleteMany?: (ids: string[]) => Promise<void>;
  isDeleting?: boolean;
}

export default function DataTable<TData extends { id: string }>({
  columns,
  data: initialData,
  endpoint,
  queryKey,
  onDeleteMany,
  isDeleting,
}: DataTableProps<TData>) {
  "use no memo";

  const [data, setData] = React.useState(initialData);

  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] =
    React.useState<SortingState>([]);

  // 🔥 sync when server data changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // 🔥 META (single delete use करेगा)
    meta: {
      removeRow: (id: string) => {
        setData((prev) => prev.filter((item) => item.id !== id));
      },
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);

  async function handleDelete() {
    if (!selectedIds.length || !onDeleteMany) return;

    const confirmDelete = confirm(
      `Delete ${selectedIds.length} items?`
    );
    if (!confirmDelete) return;

    try {
      // 🔥 Optimistic remove (bulk)
      setData((prev) =>
        prev.filter((item) => !selectedIds.includes(item.id))
      );

      await onDeleteMany(selectedIds);

      toast.success("Deleted successfully");

      table.resetRowSelection();
    } catch (error) {
      console.error(error);

      toast.error("Delete failed");

      // ❗ rollback
      setData(initialData);
    }
  }

  return (
    <div className="min-w-0 space-y-4">

      <div className="flex items-center justify-between gap-3">
        <DataTableToolbar
          table={table}
          endpoint={endpoint}
          queryKey={queryKey}
          onDeleteSuccess={(ids) => {
            setData((prev) =>
              prev.filter((item) => !ids.includes(item.id))
            );
          }}
        />

        {selectedIds.length > 0 && onDeleteMany && (
          <Button
            variant="destructive"
            className="shadow-sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Delete ({selectedIds.length})
          </Button>
        )}
      </div>

      <div className="liquid-glass-table max-h-[560px] w-full max-w-full overflow-auto rounded-3xl [scrollbar-color:#94a3b8_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-slate-600">
        <table className="min-w-[2300px] caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-white/10 bg-white/10 backdrop-blur-2xl hover:bg-white/10"
              >
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-foreground whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="liquid-glass-row border-white/10 text-foreground transition hover:bg-white/20 data-[state=selected]:bg-white/20"
              >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap px-3 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-slate-600 dark:text-slate-400"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
