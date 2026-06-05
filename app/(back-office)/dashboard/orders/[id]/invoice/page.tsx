import SalesInvoice from "@/components/Order/SalesInvoice";
import { db } from "@/lib/db";
import type { InvoiceOrder } from "@/types/order";
import { notFound } from "next/navigation";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Params) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
    },
  });

  if (!order) {
    notFound();
  }

  const subTotal = order.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const gstRate = 0;
  const gstAmount = 0;
  const shippingCost = order.shippingCost ?? 0;
  const totalAmount = subTotal + gstAmount + shippingCost;
  const invoiceOrder: InvoiceOrder = {
    ...order,
    address: order.streetAddress ?? "",
    subTotal,
    gstRate,
    gstAmount,
    shippingCost,
    totalAmount,
  };

  return <SalesInvoice order={invoiceOrder} />;
}
