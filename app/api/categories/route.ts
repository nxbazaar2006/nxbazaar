import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validators/category.schema";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { Language } from "@prisma/client";

/* =========================
   CREATE CATEGORY (ENTERPRISE)
========================= */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { imageUrl, isActive, translations } = parsed.data;

    // 🔥 generate slug per translation (type-safe)
    const formattedTranslations = await Promise.all(
      translations.map(async (t) => {
        const slug = await generateUniqueSlug(
          t.title,
          t.locale as Language,
          "category"
        );

        return {
          locale: t.locale,
          title: t.title,
          description: t.description,
          slug,
        };
      })
    );

    const category = await db.category.create({
      data: {
        imageUrl,
        isActive,
        translations: {
          create: formattedTranslations,
        },
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error("CREATE CATEGORY ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}

/* =========================
   GET CATEGORY (LOCALE SUPPORT)
========================= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") as Language | null;

    const categories = await db.category.findMany({
      where: {
        deletedAt: null, // ✅ soft delete safe
      },
      orderBy: { createdAt: "desc" },

      include: {
        products: true,
        translations: locale
          ? {
              where: { locale },
            }
          : true,
      },
    });

    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error("GET CATEGORY ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}