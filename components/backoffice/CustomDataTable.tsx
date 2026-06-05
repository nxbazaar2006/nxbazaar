"use client";
import React, { useState } from "react";
import { Order } from "@/types/dashboard";

interface Props {
  orders: Order[];
}

export default function CustomDataTable({ orders }: Props) {
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  const currentOrders = orders.slice(startIndex, endIndex);
  const totalPages = Math.ceil(orders.length / PAGE_SIZE);

  const itemStartIndex = startIndex + 1;
  const itemEndIndex = Math.min(endIndex, orders.length);

  return (
    <div className="mt-10">
      <h2 className="mb-4 bg-gradient-to-r from-orange-400 to-sky-400 bg-clip-text text-xl font-bold text-transparent">
        Recent Orders
      </h2>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-600 dark:text-sky-200">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-slate-200 text-slate-700 transition-colors hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-sky-500/10 dark:border-white/10 dark:text-slate-200"
              >
                <td className="px-6 py-4 font-medium">#{order.id}</td>
                <td className="px-6 py-4">₹ {order.total}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-gradient-to-r from-orange-500/20 to-sky-500/20 px-3 py-1 text-xs text-sky-700 dark:text-sky-100">
                    {order.orderStatus}
                  </span>
                </td>
                <td className="cursor-pointer px-6 py-4 bg-gradient-to-r from-orange-400 to-sky-400 bg-clip-text font-medium text-transparent">
                  View
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-6 flex justify-between text-slate-700 dark:text-slate-300">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {itemStartIndex}-{itemEndIndex} of {orders.length}
          </p>

          <div className="space-x-2">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-200 px-3 py-1 text-slate-700 transition-colors hover:bg-sky-500/10 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-200 dark:hover:text-sky-200"
            >
              Prev
            </button>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-slate-200 px-3 py-1 text-slate-700 transition-colors hover:bg-sky-500/10 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-200 dark:hover:text-sky-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
