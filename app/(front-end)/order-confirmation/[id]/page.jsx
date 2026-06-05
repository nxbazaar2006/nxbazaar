import { db } from "@/lib/db";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { formatINR } from "@/lib/currency";

export default async function page({ params }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: {
      id,
    },
    include: {
      orderItems: true,
    },
  });

  if (!order) {
    return <div>Order not found</div>;
  }

  const { orderItems } = order;
  const subTotal = orderItems
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);
  const shippingCost = Number(order.shippingCost ?? 0);
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-5xl">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card relative mt-6 overflow-hidden md:mt-10">
            <div className="absolute top-4 right-4">
              <Link
                href={`/dashboard/orders/${id}/invoice`}
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/70 px-4 py-3 text-xs font-bold text-slate-900 shadow-sm transition-all duration-200 backdrop-blur-xl hover:bg-white/90 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                View invoice
              </Link>
            </div>

            <div className="px-4 py-6 sm:px-8 sm:py-10">
              <div className="-my-8 divide-y divide-gray-200">
                <div className="pt-16 pb-8 text-center sm:py-8">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-green-500" />

                  <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-green-50">
                    We received your order!
                  </h1>
                  <p className="mt-2 text-sm font-normal text-gray-600 dark:text-slate-300">
                    Your order #{order.orderNumber} is completed and ready to
                    ship
                  </p>
                </div>

                <div className="py-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 sm:gap-x-20">
                    <div>
                      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Shipping Address
                      </h2>
                      <p className="mt-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                        {order.firstName} {order.lastName}
                      </p>
                      <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                        {order.streetAddress}
                        {order?.state}, {order.city}, {order?.zip},{" "}
                        {order.country}
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Payment Info
                      </h2>
                      <p className="mt-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                        {order.paymentMethod}
                      </p>
                      {/* <p className="mt-1 text-sm font-medium text-gray-600">
                        VISA
                        <br />
                        **** 4660
                      </p> */}
                    </div>
                  </div>
                </div>

                {order.qrCodeUrl ? (
                  <div className="py-8">
                    <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                      Order QR Code
                    </h2>
                    <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <div className="rounded-2xl border border-white/30 bg-white/70 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
                        <Image
                          src={order.qrCodeUrl}
                          alt={`QR code for order ${order.orderNumber}`}
                          width={180}
                          height={180}
                          unoptimized
                          className="h-[180px] w-[180px]"
                        />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Scan this QR to open the order confirmation page.
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="py-8">
                  <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                    Order Items
                  </h2>

                  <div className="flow-root mt-8">
                    <ul className="divide-y divide-gray-200 -my-5">
                      {orderItems.length > 0 &&
                        orderItems.map((item, i) => {
                          const itemQr = item.qrCodeUrl ?? item.qrData;

                          return (
                            <li
                              key={i}
                              className="flex items-start justify-between space-x-5 py-4 md:items-stretch"
                            >
                              <div className="flex items-stretch">
                                <div className="flex-shrink-0">
                                  <Image
                                    width={200}
                                    height={200}
                                    className="h-20 w-20 rounded-2xl object-cover"
                                    src={item.imageUrl || "/placeholder.png"}
                                    alt={item.title || "Order item"}
                                  />
                                </div>

                                <div className="flex flex-col justify-between ml-5 w-44">
                                  <p className="flex-1 text-sm font-bold text-gray-900 dark:text-gray-300">
                                    {item.title || "Order item"}
                                  </p>
                  <p className="text-[13px] font-medium text-gray-500">
                                    ({formatINR(item.price)} x {item.quantity})
                                  </p>
                                  {itemQr ? (
                                    <div className="mt-2">
                                      <Image
                                        src={itemQr}
                                        alt={`QR for ${item.title || "item"}`}
                                        width={96}
                                        height={96}
                                        unoptimized
                          className="h-24 w-24 rounded-2xl border border-white/30 bg-white/70 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <div className="ml-auto">
                                <p className="text-sm font-bold text-right text-gray-900 dark:text-gray-300">
                                  {formatINR(item.price * item.quantity)}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>

                <div className="py-8">
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Sub total
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {formatINR(subTotal)}
                      </p>
                    </li>
                    <li className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Shipping Cost
                      </p>
                      <p className="text-[13px] font-medium text-gray-500">
                        The Order will be delivered in{" "}
                        {shippingCost == 50
                          ? "3"
                          : shippingCost == 75
                          ? "2"
                          : "1"}{" "}
                        days{" "}
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {formatINR(shippingCost)}
                      </p>
                    </li>
                    <li className="flex items-center justify-between">
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        Total
                      </p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {formatINR(Number(subTotal) + shippingCost)}
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
