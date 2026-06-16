"use client";

import Image from "next/image";
import React, { useRef } from "react";
import logo from "@/public/limiLogo.webp";
import { convertIsoDatetoNormal } from "@/lib/convertIsoDatetoNormal";
import { formatINR } from "@/lib/currency";
import type { InvoiceOrder } from "@/types/order";

type Props = {
  order: InvoiceOrder;
};

export default function SalesInvoice({ order }: Props) {

  const invoiceRef = useRef<HTMLDivElement>(null);

  const invoiceDate = convertIsoDatetoNormal(order.createdAt);

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col">

      <div className="flex justify-end mb-8">
        <button
          onClick={handlePrint}
          className="px-4 py-3 text-xs font-bold bg-slate-800 text-white rounded-2xl"
        >
          Download / Print Invoice
        </button>
      </div>

      <div ref={invoiceRef}>

        <div className="max-w-4xl mx-auto border p-8 rounded-2xl">

          <div className="flex justify-between border-b pb-8">

            <div>
              <h2>Bill From:</h2>
              <p>LimiFood</p>
              <p>Canada</p>
              <p>sales@limifood.com</p>
            </div>

            <Image src={logo} alt="logo" className="w-36 h-24" />

          </div>

          <div className="flex justify-between border-b py-8">

            <div>
              <h2>Bill To:</h2>
              <p>{order.firstName} {order.lastName}</p>
              <p>{order.address}</p>
              <p>{order.city} - {order.country}</p>
              <p>{order.email}</p>
            </div>

            <div>
              <p>Invoice #: {order.orderNumber}</p>
              <p>Date: {invoiceDate}</p>
            </div>

          </div>

          {order.qrCodeUrl ? (
            <div className="mt-6 flex items-center justify-between border-b pb-6">
              <div>
                <h2 className="text-sm font-semibold">Order QR Code</h2>
                <p className="text-xs text-slate-600">
                  Scan to open the order confirmation page.
                </p>
              </div>

              <Image
                src={order.qrCodeUrl}
                alt={`QR code for order ${order.orderNumber}`}
                width={120}
                height={120}
                unoptimized
                className="h-[120px] w-[120px]"
              />
            </div>
          ) : null}

          <table className="w-full mt-8 text-sm">

            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>QR</th>
              </tr>
            </thead>

            <tbody>

              {order.orderItems.map((item) => {

                const lineTotal = (item.price * item.quantity).toFixed(2);
                const itemTitle = item.title ?? "Product";
                const itemImageUrl = item.imageUrl || "/placeholder.png";

                return (
                  <tr key={item.id}>

                    <td>
                      <Image
                        src={itemImageUrl}
                        width={40}
                        height={40}
                        alt={itemTitle}
                        className="rounded-2xl"
                      />
                    </td>

                    <td>{itemTitle}</td>

                    <td>{item.quantity}</td>

                    <td>{formatINR(item.price)}</td>

                    <td>{formatINR(Number(lineTotal))}</td>

                    <td>
                      {item.qrCodeUrl ? (
                        <Image
                          src={item.qrCodeUrl}
                          width={72}
                          height={72}
                          alt={`QR for ${item.title}`}
                          unoptimized
                          className="h-18 w-18 rounded-2xl border border-slate-200 bg-white p-1"
                        />
                      ) : (
                        "-"
                      )}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

          <div className="mt-8 flex justify-end">

            <div className="w-64 space-y-2 text-sm">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(order.subTotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>GST ({order.gstRate}%)</span>
                <span>{formatINR(order.gstAmount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatINR(order.shippingCost)}</span>
              </div>

              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatINR(order.totalAmount)}</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
