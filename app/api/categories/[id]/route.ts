import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validators/category.schema";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { Language } from "@prisma/client";

interface RouteContext {
  params: {
    id: string;
  };
}

/* =========================
   GET CATEGORY BY ID
========================= */
export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;

    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") as Language | null;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: true,
        translations: locale
          ? { where: { locale } }
          : true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error("GET CATEGORY ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE CATEGORY (SOFT DELETE)
========================= */
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;

    const category = await db.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const deleted = await db.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(deleted);
  } catch (error: unknown) {
    console.error("DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE CATEGORY (ENTERPRISE)
========================= */
export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;

    const body: unknown = await req.json();

    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { imageUrl, isActive, translations } = parsed.data;

    const oldTranslations = await db.categoryTranslation.findMany({
      where: { categoryId: id },
    });

    const formattedTranslations = await Promise.all(
      translations.map(async (t) => {
        const existing = oldTranslations.find(
          (ot) => ot.locale === t.locale
        );

        // ✅ keep slug if title same
        if (existing && existing.title === t.title) {
          return {
            ...t,
            slug: existing.slug,
          };
        }

        const slug = await generateUniqueSlug(
          t.title,
          t.locale as Language,
          "category"
        );

        return {
          ...t,
          slug,
        };
      })
    );

    await db.categoryTranslation.deleteMany({
      where: { categoryId: id },
    });

    const updated = await db.category.update({
      where: { id },
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

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    );
  }
}