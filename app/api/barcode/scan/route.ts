import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";

const scanSchema = z.object({
  code: z.string().trim().min(1, "Barcode or SKU is required"),
});

async function findVariant(code: string) {
  return db.productVariant.findFirst({
    where: {
      OR: [
        { barcode: code },
        { sku: code },
        { productCode: code },
        { product: { productCode: code } },
      ],
    },
    include: {
      attributes: true,
      wholesalePricing: true,
      product: {
        include: {
          images: true,
          translations: true,
          category: {
            include: {
              translations: true,
            },
          },
          subCategory: {
            include: {
              translations: true,
            },
          },
        },
      },
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = scanSchema.safeParse({
      code: searchParams.get("code"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid scan code",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const variant = await findVariant(parsed.data.code);

    if (!variant) {
      return NextResponse.json(
        { success: false, error: "Product variant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        scanCode: parsed.data.code,
        variant,
      },
    });
  } catch (error) {
    console.error("BARCODE_SCAN_ERROR", error);

    return NextResponse.json(
      { success: false, error: "Failed to scan barcode" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const parsed = scanSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid scan code",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const variant = await findVariant(parsed.data.code);

    if (!variant) {
      return NextResponse.json(
        { success: false, error: "Product variant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        scanCode: parsed.data.code,
        variant,
      },
    });
  } catch (error) {
    console.error("BARCODE_SCAN_ERROR", error);

    return NextResponse.json(
      { success: false, error: "Failed to scan barcode" },
      { status: 500 }
    );
  }
}
