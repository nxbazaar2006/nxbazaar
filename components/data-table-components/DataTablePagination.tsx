"use client"

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"
import { Table } from "@tanstack/react-table"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

const navBtn =
  "h-9 w-9 rounded-2xl p-0 text-foreground disabled:pointer-events-none disabled:opacity-40"

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card px-3 py-3 shadow-sm">
      <div className="flex min-w-[720px] items-center justify-between gap-4 text-foreground">
        <div className="text-muted-foreground text-sm">
          <span className="font-semibold">
            {table.getFilteredSelectedRowModel().rows.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          row(s) selected.
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <p className="text-foreground whitespace-nowrap text-sm font-medium">
              Rows per page
            </p>

            <Select
              value={`${pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-9 w-[80px] rounded-2xl text-foreground">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>

              <SelectContent side="top" className="rounded-2xl">
                {[10, 20, 30, 40, 50, 100].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-[130px] items-center justify-center rounded-2xl border border-border bg-muted px-4 py-2 text-sm font-semibold">
            Page&nbsp;
            <span className="text-foreground">
              {pageIndex + 1}
            </span>
            &nbsp;of&nbsp;{pageCount || 1}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={`${navBtn} hidden lg:flex`}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className={navBtn}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className={navBtn}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className={`${navBtn} hidden lg:flex`}
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
