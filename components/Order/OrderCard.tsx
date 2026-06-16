import { convertIsoDatetoNormal } from "@/lib/convertIsoDatetoNormal";
import { generateSlug } from "@/lib/generateSlug";
import { formatINR } from "@/lib/currency";
import Link from "next/link";
import type { InvoiceOrder } from "@/types/order";

type Props = {
  order: InvoiceOrder;
};

export default function OrderCard({ order }: Props) {

  const orderCreationDate = convertIsoDatetoNormal(order.createdAt);

  if (order.orderItems.length === 0) return null;

  return (
    <li className="overflow-hidden bg-white border border-gray-200 rounded-2xl">
      <div className="lg:flex">

        <div className="w-full border-b border-gray-200 lg:max-w-xs lg:border-b-0 lg:border-r bg-gray-50">
          <div className="px-4 py-6 sm:p-6 lg:p-8">

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-1">

              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-sm font-bold text-gray-900">
                  #{order.orderNumber}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {orderCreationDate}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatINR(order.subTotal)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">GST ({order.gstRate}%)</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatINR(order.gstAmount)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Shipping</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatINR(order.shippingCost)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatINR(order.totalAmount)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <span className="text-sm font-bold text-gray-900">
                  {order.orderStatus}
                </span>
              </div>

            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 sm:p-6 lg:p-8">
          <ul className="space-y-7">

            {order.orderItems.map((item) => {

              const slug = generateSlug(item.title ?? "product");
              const itemTitle = item.title ?? "Order item";
              const itemImageUrl = item.imageUrl || "/placeholder.png";

              return (
                <li key={item.id} className="relative flex pb-10 sm:pb-0">

                  <div className="flex-shrink-0">
                    <img
                      className="object-cover rounded-2xl w-28 h-28"
                      src={itemImageUrl}
                      alt={itemTitle}
                    />
                  </div>

                  <div className="flex flex-col justify-between flex-1 ml-5">

                    <div className="sm:grid sm:grid-cols-2 sm:gap-x-5">

                      <div>
                        <p className="text-base font-bold text-gray-900">
                          {itemTitle}
                        </p>
                      </div>

                      <div className="mt-4 sm:mt-0 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>

                        <p className="text-base font-bold text-gray-900">
                          {formatINR(item.price)}
                        </p>
                      </div>

                    </div>

                    <div className="absolute bottom-0 left-0 sm:relative">
                      <div className="flex space-x-5">

                        <Link
                          href={`/products/${slug}`}
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          View Product
                        </Link>

                        <span className="text-gray-200">|</span>

                        <Link
                          href={`/dashboard/orders/${order.id}/invoice`}
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          View Invoice
                        </Link>

                      </div>
                    </div>

                  </div>
                </li>
              );
            })}

          </ul>
        </div>

      </div>
    </li>
  );
}
