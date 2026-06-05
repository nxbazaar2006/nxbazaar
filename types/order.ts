import type { Prisma } from "@prisma/client";

export type Order = Prisma.OrderGetPayload<{
  include: {
    orderItems: true;
  };
}>;

export type InvoiceOrder = Order & {
  address: string;
  subTotal: number;
  gstRate: number;
  gstAmount: number;
  shippingCost: number;
  totalAmount: number;
};

export interface CheckoutFormData {
  city: string;
  country: string;
  district?: string;
  email: string;
  firstName: string;
  lastName: string;
  paymentMethod: string;
  phone: string;
  shippingCost: string | number;
  state?: string;
  streetAddress: string;
  userId?: string;
  zip?: string;
}

export interface OrderItemInput {
  id: string;
  productVariantId?: string;
  title: string;
  imageUrl: string;
  qty: string | number;
  salePrice?: string | number;
  vendorId?: string;
}

export interface CreateOrderPayload {
  checkoutFormData: CheckoutFormData;
  orderItems: OrderItemInput[];
}
