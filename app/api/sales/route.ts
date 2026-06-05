import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const sales = await db.sale.findMany({
      orderBy: {
        createdAt: "desc",
      },
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

    const mappedSales = sales.map((sale) => {
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

      return {
        id: sale.id,
        orderId: sale.orderId,
        vendorId: sale.vendorId,
        productTitle:
          matchedItem?.title ?? sale.product?.title ?? sale.productVariant?.title ?? "Product",
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
    });

    return NextResponse.json({
      success: true,
      message: "Sales fetched successfully",
      data: mappedSales,
    });
  } catch (error) {
    console.error("SALES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sales",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
