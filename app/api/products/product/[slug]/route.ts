import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    /* ================= VALIDATE ================= */

    if (!slug) {
      return NextResponse.json(
        { message: "Invalid slug" },
        { status: 400 }
      );
    }

    /* ================= FETCH PRODUCT ================= */

    const product = await db.product.findUnique({
      where: { slug },

      include: {
        /* relations */
        category: true,
        subCategory: true,
        user: true,
        hsnCode: true,

        /* gallery */
        images: {
          orderBy: {
            isPrimary: "desc",
          },
        },

        /* variants */
        variants: {
          include: {
            attributes: true,
            wholesalePricing: {
              orderBy: {
                minQty: "asc",
              },
            },
          },

          orderBy: {
            isDefault: "desc",
          },
        },

        /* multilingual */
        translations: true,

        /* blogs linked */
        blogs: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    /* ================= NOT FOUND ================= */

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    /* ================= SUCCESS ================= */

    return NextResponse.json(product);
  } catch (error) {
    console.error("PRODUCT DETAIL API ERROR ❌", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}