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
      <h2 className="mb-4 text-xl font-bold text-foreground">
        Recent Orders
      </h2>

      <div className="neumorphic-card overflow-x-auto p-6">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-muted-foreground">Order ID</th>
              <th className="px-6 py-3 text-muted-foreground">Amount</th>
              <th className="px-6 py-3 text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-muted-foreground">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-white/10 text-foreground transition-colors hover:bg-white/20"
              >
                <td className="px-6 py-4 font-medium">#{order.id}</td>
                <td className="px-6 py-4">₹ {order.total}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-foreground">
                    {order.orderStatus}
                  </span>
                </td>
                <td className="cursor-pointer px-6 py-4 font-medium text-foreground">
                  View
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-6 flex justify-between text-foreground">
          <p className="text-sm text-muted-foreground">
            Showing {itemStartIndex}-{itemEndIndex} of {orders.length}
          </p>

          <div className="space-x-2">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="soft-button px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="soft-button px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
