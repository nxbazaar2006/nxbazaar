import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createOrderSchema,
  type CreateOrderInput,
} from "@/lib/validators/order.schema";
import { z } from "zod";
import QRCode from "qrcode";

type OrderRequestItem = {
  id: string;
  productVariantId?: string;
  title?: string;
  imageUrl?: string;
  qty: number;
  vendorId?: string;
};

type NormalizedOrderItem = {
  productId: string;
  productVariantId: string;
  vendorId: string;
  quantity: number;
  price: number;
  title: string;
  imageUrl: string | null;
};

// ✅ Generate Order Number
function generateOrderNumber(length: number): string {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let orderNumber = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    orderNumber += characters.charAt(randomIndex);
  }

  return orderNumber;
}

function buildOrderQrData(orderId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  return `${baseUrl}/order-confirmation/${orderId}`;
}

function normalizeOptionalId(value: string | undefined | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

async function buildQrCodeUrl(text: string) {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 4,
    width: 256,
  });
}

// ✅ CREATE ORDER
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body: CreateOrderInput = createOrderSchema.parse(
      await request.json()
    );
    const { checkoutFormData, orderItems } = body;
    const parsedOrderItems = orderItems as OrderRequestItem[];
    const userId = session?.user?.id ?? checkoutFormData.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      city,
      country,
      district,
      email,
      firstName,
      lastName,
      paymentMethod,
      phone,
      shippingCost,
      state,
      streetAddress,
      zip,
    } = checkoutFormData;

    const result = await db.$transaction(async (prisma) => {
      const products = await prisma.product.findMany({
        where: {
          id: { in: parsedOrderItems.map((item) => item.id) },
        },
        include: {
          images: true,
          variants: true,
        },
      });
      const productById = new Map(products.map((product) => [product.id, product]));

      const normalizedItems: NormalizedOrderItem[] = parsedOrderItems.map(
        (item) => {
          const product = productById.get(item.id);

          if (!product) {
            throw new Error(`Product not found: ${item.id}`);
          }

          const variant =
            product.variants.find((entry) => entry.id === item.productVariantId) ??
            product.variants.find((entry) => entry.isDefault) ??
            product.variants[0];

          if (!variant) {
            throw new Error(`Product variant not found: ${product.title}`);
          }

          const imageUrl =
            variant.image ??
            product.imageUrl ??
            product.images.find((image) => image.isPrimary)?.url ??
            product.images[0]?.url ??
            item.imageUrl ??
            null;

          return {
            productId: product.id,
            productVariantId: variant.id,
            vendorId: normalizeOptionalId(item.vendorId) ?? product.userId,
            quantity: Number(item.qty),
            price: Number(variant.salePrice ?? variant.price),
            title: item.title ?? product.title,
            imageUrl,
          };
        }
      );

      const newOrder = await prisma.order.create({
        data: {
          userId,
          firstName,
          lastName,
          email,
          phone,
          streetAddress,
          city,
          state: state ?? district ?? null,
          country,
          zip: zip ?? null,
          shippingCost: Number(shippingCost),
          paymentMethod,
          orderNumber: generateOrderNumber(8),
        },
      });

      const orderQrData = buildOrderQrData(newOrder.id);
      const orderQrCodeUrl = await buildQrCodeUrl(orderQrData);

      await prisma.order.update({
        where: { id: newOrder.id },
        data: {
          qrData: orderQrData,
          qrCodeUrl: orderQrCodeUrl,
        },
      });

      const itemRows = await Promise.all(
        normalizedItems.map(async (item) => {
          const qrData = `${orderQrData}?item=${item.productVariantId}`;
          const qrCodeUrl = await buildQrCodeUrl(qrData);

          return {
            productId: item.productId,
            productVariantId: item.productVariantId,
            vendorId: item.vendorId,
            quantity: item.quantity,
            price: item.price,
            orderId: newOrder.id,
            imageUrl: item.imageUrl,
            title: item.title,
            qrData,
            qrCodeUrl,
          };
        })
      );

      await prisma.orderItem.createMany({
        data: itemRows,
      });

      await prisma.sale.createMany({
        data: normalizedItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
          vendorId: item.vendorId,
          total: item.price * item.quantity,
        })),
      });

      const completeOrder = await prisma.order.findUniqueOrThrow({
        where: { id: newOrder.id },
        include: {
          orderItems: true,
          sales: true,
        },
      });

      return completeOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;

      return NextResponse.json(
        {
          success: false,
          message: "Invalid order data",
          errors: zodError.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create Order" },
      { status: 500 }
    );
  }
}

// ✅ GET ALL ORDERS
export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { orderItems: true },
    });

    return NextResponse.json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to Fetch Orders", error },
      { status: 500 }
    );
  }
}
