import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    /* ================= QUERY PARAMS ================= */

    const sortBy = searchParams.get("sort") as "asc" | "desc" | null;

    const min = searchParams.get("min");
    const max = searchParams.get("max");

    const searchTerm = searchParams.get("search") ?? "";

    const page = Number(searchParams.get("page") ?? 1);

    const categoryId = searchParams.get("categoryId");
    const subCategoryId = searchParams.get("subCategoryId");

    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    /* ================= WHERE ================= */

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    /* ---------- category ---------- */
    if (categoryId) {
      where.categoryId = categoryId;
    }

    /* ---------- sub category ---------- */
    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    }

    /* ---------- search ---------- */
    if (searchTerm) {
      where.OR = [
        {
          title: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },

        {
          tags: {
            has: searchTerm,
          },
        },

        {
          translations: {
            some: {
              OR: [
                {
                  title: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        },
      ];
    }

    /* ---------- variant price filter ---------- */
    if (min || max) {
      where.variants = {
        some: {
          price: {
            ...(min ? { gte: Number(min) } : {}),
            ...(max ? { lte: Number(max) } : {}),
          },
        },
      };
    }

    /* ================= ORDER BY ================= */

    let orderBy: Prisma.ProductOrderByWithRelationInput = {
      createdAt: "desc",
    };

    /*
      Prisma directly nested variant price sort complex hota hai,
      ecommerce me commonly createdAt fallback use karte hain.
      custom sorting frontend side bhi possible.
    */

    if (sortBy) {
      orderBy = {
        createdAt: sortBy,
      };
    }

    /* ================= QUERY ================= */

    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,

        include: {
          category: true,
          subCategory: true,

          images: {
            orderBy: {
              isPrimary: "desc",
            },
          },

          variants: {
            include: {
              attributes: true,
              wholesalePricing: true,
            },

            orderBy: {
              isDefault: "desc",
            },
          },

          translations: true,
        },
      }),

      db.product.count({
        where,
      }),
    ]);

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
      products,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error("FILTER PRODUCTS ERROR ❌", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}