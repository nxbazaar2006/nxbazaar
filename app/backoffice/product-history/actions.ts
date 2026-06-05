"use server";

import { db } from "@/lib/db";

export type ProductHistorySearchResult = {
  product: {
    id: string;
    title: string;
    productCode: string | null;
  };
  matchedVariant: {
    id: string;
    title: string;
    sku: string | null;
    barcode: string | null;
    productCode: string | null;
  } | null;
  variants: {
    id: string;
    title: string;
    sku: string | null;
    barcode: string | null;
    productCode: string | null;
  }[];
  history: {
    id: string;
    productId: string;
    productCode: string | null;
    productTitle: string;
    action: string;
    field: string | null;
    oldValue: string | null;
    newValue: string | null;
    variantId: string | null;
    sku: string | null;
    changedByUserId: string | null;
    changedByUserCode: string | null;
    changedByRole: string | null;
    sellerCode: string | null;
    createdAt: string;
  }[];
};

export async function searchProductHistory(
  value: string
): Promise<{ success: true; data: ProductHistorySearchResult } | { success: false; error: string }> {
  const scanCode = value.trim();

  if (!scanCode) {
    return { success: false, error: "Scan code required" };
  }

  const matchedVariant = await db.productVariant.findFirst({
    where: {
      OR: [
        { sku: scanCode },
        { barcode: scanCode },
        { productCode: scanCode },
      ],
    },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          productCode: true,
          variants: {
            select: {
              id: true,
              title: true,
              sku: true,
              barcode: true,
              productCode: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  const product =
    matchedVariant?.product ??
    (await db.product.findFirst({
      where: { productCode: scanCode },
      select: {
        id: true,
        title: true,
        productCode: true,
        variants: {
          select: {
            id: true,
            title: true,
            sku: true,
            barcode: true,
            productCode: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }));

  const deletedProductHistory = product
    ? null
    : await db.productHistory.findFirst({
        where: {
          OR: [
            { productCode: scanCode },
            { sku: scanCode },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
  const productId = product?.id ?? deletedProductHistory?.productId;

  if (!productId) {
    return { success: false, error: "Product not found" };
  }

  const history = await db.productHistory.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
  const fallbackProductCode =
    deletedProductHistory?.productCode ??
    history.find((entry) => entry.productCode)?.productCode ??
    null;
  const fallbackProductTitle =
    deletedProductHistory?.productTitle ??
    history.find((entry) => entry.productTitle)?.productTitle ??
    "Deleted product";

  return {
    success: true,
    data: {
      product: {
        id: productId,
        title: product?.title ?? fallbackProductTitle,
        productCode: product?.productCode ?? fallbackProductCode,
      },
      matchedVariant: matchedVariant
        ? {
            id: matchedVariant.id,
            title: matchedVariant.title,
            sku: matchedVariant.sku,
            barcode: matchedVariant.barcode,
            productCode: matchedVariant.productCode,
          }
        : null,
      variants: product?.variants ?? [],
      history: history.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
      })),
    },
  };
}
