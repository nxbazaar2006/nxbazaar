"use server";

import { db } from "@/lib/db";

type SaleRow = {
  id: string;
  orderId: string;
  vendorId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  productQty: number;
  total: number;
  createdAt: string;
  order?: {
    id: string;
    firstName: string;
    email: string;
    phone: string;
    orderNumber: string;
  };
};

export async function getSales() {
  try {
    const sales = await db.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            orderItems: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            images: {
              select: {
                url: true,
                isPrimary: true,
              },
            },
          },
        },
        productVariant: {
          select: {
            id: true,
            title: true,
            price: true,
            salePrice: true,
            image: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return sales.map((sale) => {
      const matchedItem = sale.order?.orderItems.find(
        (item) =>
          item.productVariantId === sale.productVariantId ||
          item.productId === sale.productId
      );
      const price =
        matchedItem?.price ??
        sale.productVariant?.salePrice ??
        sale.productVariant?.price ??
        0;
      const quantity =
        matchedItem?.quantity ??
        (price > 0 ? Math.max(1, Math.round(sale.total / price)) : 1);
      const image =
        matchedItem?.imageUrl ??
        sale.productVariant?.image ??
        sale.product?.imageUrl ??
        sale.product?.images.find((item) => item.isPrimary)?.url ??
        sale.product?.images[0]?.url ??
        "";

      const mapped: SaleRow = {
        id: sale.id,
        orderId: sale.orderId,
        vendorId: sale.vendorId,
        productTitle: matchedItem?.title ?? sale.product?.title ?? sale.productVariant?.title ?? "Product",
        productImage: image,
        productPrice: price,
        productQty: quantity,
        total: sale.total,
        createdAt: sale.createdAt.toISOString(),
        order: sale.order
          ? {
              id: sale.order.id,
              firstName: sale.order.firstName,
              email: sale.order.email,
              phone: sale.order.phone,
              orderNumber: sale.order.orderNumber,
            }
          : undefined,
      };

      return mapped;
    });
  } catch (error) {
    console.error("GET SALES ERROR:", error);
    return [];
  }
}
