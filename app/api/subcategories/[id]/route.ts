import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { subCategorySchema } from "@/lib/validators/subcategory.schema";
import { Language } from "@prisma/client";
import { generateUniqueTranslationSlug } from "@/lib/slug/translationSlug.service";

// ✅ GET SINGLE
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const subCategory = await db.subCategory.findUnique({
      where: { id },
      include: {
        category: true,
        hsnCode: true,
        translations: true,
      },
    });

    if (!subCategory) {
      return NextResponse.json(
        { message: "SubCategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subCategory);
  } catch (error) {
    console.error("GET BY ID ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch SubCategory",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = subCategorySchema.parse(body);
    const translations = data.translations.map((translation) => ({
      ...translation,
      locale: translation.locale.toUpperCase() as Language,
    }));

    const existing = await db.subCategory.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "SubCategory not found" },
        { status: 404 }
      );
    }

    // 🧠 smart translation update (NO DATA LOSS)
    const updated = await db.subCategory.update({
      where: { id },
      data: {
        slug: data.slug,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        categoryId: data.categoryId,
        hsnCodeId: data.hsnCodeId,

        translations: {
          deleteMany: { subCategoryId: id },
          create: await Promise.all(
            translations.map(async (t) => ({
              locale: t.locale,
              title: t.title,
              description: t.description,
              slug: await generateUniqueTranslationSlug(
                "subcategory",
                t.locale,
                t.slug ?? t.title
              ),
            }))
          ),
        },
      },
      include: {
        category: true,
        hsnCode: true,
        translations: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to update SubCategory",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ✅ DELETE
export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const existing = await db.subCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "SubCategory not found" },
        { status: 404 }
      );
    }

    await db.subCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "SubCategory deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to delete SubCategory",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
