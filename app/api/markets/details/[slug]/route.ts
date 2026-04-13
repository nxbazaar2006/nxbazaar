import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { marketSchema } from "@/lib/validators/market.schema";
import { z } from "zod";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

/* =====================================================
   GET SINGLE MARKET BY SLUG
===================================================== */
export async function GET(_: Request, { params }: Params) {
  try {
    const { slug } = await params;

    /* -----------------------------
       FETCH MARKET
    ------------------------------ */
    const market = await db.market.findUnique({
      where: {
        slug,
      },

      include: {
        categories: true,
        translations: {
          orderBy: {
            locale: "asc",
          },
        },
      },
    });

    /* -----------------------------
       NOT FOUND
    ------------------------------ */
    if (!market) {
      return NextResponse.json(
        {
          success: false,
          message: "Market not found",
        },
        { status: 404 }
      );
    }

    /* -----------------------------
       OPTIONAL VALIDATION
       (response safety)
    ------------------------------ */
    const validatedMarket = marketSchema
      .partial()
      .safeParse({
        ...market,
        categoryIds: market.categories.map((category) => category.id),
      });

    if (!validatedMarket.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Market response validation failed",
          errors: validatedMarket.error.flatten(),
        },
        { status: 500 }
      );
    }

    /* -----------------------------
       SUCCESS
    ------------------------------ */
    return NextResponse.json(
      {
        success: true,
        data: market,
        message: "Market fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("GET MARKET ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch market",
      },
      { status: 500 }
    );
  }
}