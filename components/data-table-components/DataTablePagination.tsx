"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons"
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
  "h-9 w-9 rounded-2xl border border-white/10 bg-white/70 p-0 text-slate-700 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-pink-500/10 hover:via-purple-500/10 hover:to-orange-500/10 hover:text-sky-700 hover:shadow-lg disabled:pointer-events-none disabled:opacity-40 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:text-sky-200"

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-white/60 px-3 py-3 shadow-sm backdrop-blur-xl dark:bg-slate-950/50">
      <div className="flex min-w-[720px] items-center justify-between gap-4 text-slate-700 dark:text-slate-300">
        <div className="text-sm text-slate-600 dark:text-slate-400">
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
            <p className="whitespace-nowrap text-sm font-medium">
              Rows per page
            </p>

            <Select
              value={`${pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-9 w-[80px] rounded-2xl border border-white/10 bg-white/70 text-slate-700 shadow-sm backdrop-blur-xl dark:bg-slate-950/60 dark:text-slate-200">
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

          <div className="flex min-w-[130px] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-purple-500/10 px-4 py-2 text-sm font-semibold">
            Page&nbsp;
            <span className="bg-gradient-to-r from-orange-500 via-sky-500 to-purple-500 bg-clip-text text-transparent">
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
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className={navBtn}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className={navBtn}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className={`${navBtn} hidden lg:flex`}
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}