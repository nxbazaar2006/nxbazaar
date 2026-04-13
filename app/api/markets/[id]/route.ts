import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { marketSchema } from "@/lib/validators/market.schema";
import { z } from "zod";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
   GET SINGLE MARKET
===================================================== */
export async function GET(
  _: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const market = await db.market.findUnique({
      where: { id },

      include: {
        categories: true,
        translations: {
          orderBy: {
            locale: "asc",
          },
        },
      },
    });

    if (!market) {
      return NextResponse.json(
        {
          success: false,
          message: "Market not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: market,
        message: "Market fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleServerError(error, "GET SINGLE MARKET ERROR");
  }
}

/* =====================================================
   UPDATE MARKET
===================================================== */
export async function PUT(
  req: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    /* -----------------------------
       VALIDATE INPUT
    ------------------------------ */
    const body = await req.json();
    const data = marketSchema.parse(body);

    /* -----------------------------
       CHECK EXISTENCE
    ------------------------------ */
    const existingMarket = await db.market.findUnique({
      where: { id },
    });

    if (!existingMarket) {
      return NextResponse.json(
        {
          success: false,
          message: "Market not found",
        },
        { status: 404 }
      );
    }

    /* -----------------------------
       CHECK SLUG CONFLICT
    ------------------------------ */
    const slugExists = await db.market.findFirst({
      where: {
        slug: data.slug,
        NOT: {
          id,
        },
      },
    });

    if (slugExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug already exists",
        },
        { status: 409 }
      );
    }

    /* -----------------------------
       UPDATE MARKET
    ------------------------------ */
    const updatedMarket = await db.market.update({
      where: { id },

      data: {
        title: data.title,
        slug: data.slug,
        logoUrl: data.logoUrl,
        description: data.description,
        isActive: data.isActive ?? true,

        categories: {
          set:
            data.categoryIds?.map((categoryId) => ({
              id: categoryId,
            })) ?? [],
        },

        translations: data.translations
          ? {
              deleteMany: {},
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
        data: updatedMarket,
        message: "Market updated successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleServerError(error, "UPDATE MARKET ERROR");
  }
}

/* =====================================================
   DELETE MARKET
===================================================== */
export async function DELETE(
  _: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    /* -----------------------------
       CHECK EXISTENCE
    ------------------------------ */
    const existingMarket = await db.market.findUnique({
      where: { id },
    });

    if (!existingMarket) {
      return NextResponse.json(
        {
          success: false,
          message: "Market not found",
        },
        { status: 404 }
      );
    }

    /* -----------------------------
       DELETE MARKET
    ------------------------------ */
    await db.market.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Market deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleServerError(error, "DELETE MARKET ERROR");
  }
}