import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type Params = {
  params: {
    slug: string;
    locale?: string;
  };
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug, locale } = params;

    if (!slug) {
      return NextResponse.json(
        { message: "Invalid slug" },
        { status: 400 }
      );
    }

    /* ================= SLUG BUILD ================= */

    const finalSlug =
      locale && locale !== "en" ? `${locale}/${slug}` : slug;

    /* ================= QUERY ================= */

    const product = await db.product.findUnique({
      where: { slug: finalSlug },

      include: {
        category: true,
        subCategory: true,
        user: true,
        hsnCode: true,

        images: {
          orderBy: { isPrimary: "desc" },
        },

        variants: {
          include: {
            attributes: true,
            wholesalePricing: {
              orderBy: { minQty: "asc" },
            },
          },
          orderBy: { isDefault: "desc" },
        },

        translations: true,

        blogs: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    /* ================= FALLBACK (TRANSLATION) ================= */

    if (!product) {
      // try fallback by base slug (English)
      const fallback = await db.product.findFirst({
        where: {
          OR: [
            { slug }, // english
            {
              translations: {
                some: {
                  slug: finalSlug,
                },
              },
            },
          ],
        },
        include: {
          translations: true,
        },
      });

      if (!fallback) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(fallback);
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}