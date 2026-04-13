import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { marketSchema } from "@/lib/validators/market.schema";
import { z } from "zod";

/* =====================================================
   HELPERS
===================================================== */
function handleServerError(error: unknown, label: string) {
  console.error(`${label}:`, error);

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
      message: "Internal Server Error",
    },
    { status: 500 }
  );
}

/* =====================================================
   CREATE MARKET
===================================================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    /* -----------------------------
       VALIDATE INPUT
    ------------------------------ */
    const data = marketSchema.parse(body);

    /* -----------------------------
       CHECK DUPLICATE SLUG
    ------------------------------ */
    const existingMarket = await db.market.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingMarket) {
      return NextResponse.json(
        {
          success: false,
          message: `Market slug "${data.slug}" already exists`,
        },
        { status: 409 }
      );
    }

    /* -----------------------------
       CREATE MARKET
    ------------------------------ */
    const newMarket = await db.market.create({
      data: {
        title: data.title,
        slug: data.slug,
        logoUrl: data.logoUrl,
        description: data.description,
        isActive: data.isActive ?? true,

        categories: {
          connect:
            data.categoryIds?.map((id) => ({
              id,
            })) ?? [],
        },

        translations: data.translations
          ? {
              create: data.translations.map((translation) => ({
                locale: translation.locale,
                title: translation.title,
                description: translation.description,
                slug: translation.slug,
              })),
            }
          : undefined,
      },

      include: {
        categories: true,
        translations: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newMarket,
        message: "Market created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleServerError(error, "POST MARKET ERROR");
  }
}

/* =====================================================
   GET ALL MARKETS
===================================================== */
export async function GET() {
  try {
    const markets = await db.market.findMany({
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json(
      {
        success: true,
        data: markets,
        message: "Markets fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleServerError(error, "GET MARKETS ERROR");
  }
}

/* =====================================================
   BULK DELETE MARKETS
===================================================== */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const ids = body.ids as string[];

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No market IDs provided",
        },
        { status: 400 }
      );
    }

    const deletedMarkets = await db.market.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: deletedMarkets.count,
        message: "Markets deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleServerError(error, "DELETE MARKETS ERROR");
  }
}