"use client";
"use no memo";

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
  Table,
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

  onDeleteMany?: (ids: string[]) => Promise<void>;
  isDeleting?: boolean;
}

export default function DataTable<TData extends { id: string }>({
  columns,
  data: initialData,
  onDeleteMany,
  isDeleting,
}: DataTableProps<TData>) {
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
    <div className="space-y-4">

      <div className="flex justify-between items-center">
        <DataTableToolbar table={table} />

        {selectedIds.length > 0 && onDeleteMany && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Delete ({selectedIds.length})
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                <TableCell colSpan={columns.length}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}