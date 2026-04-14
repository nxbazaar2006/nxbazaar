import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subCategorySchema } from "@/lib/validators/subcategory.schema";
import { generateUniqueSlug } from "@/lib/utils/generateUniqueSlug";

/* ================= TYPES ================= */

type SubCategoryInput = {
  title: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  categoryId: string;
  hsnCodeId?: string;
};

/* ================= CREATE ================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data: SubCategoryInput = subCategorySchema.parse(body);

    // ✅ Unique slug
    const slug = await generateUniqueSlug(data.title, "subCategory");

    // ✅ Category check
    const categoryExists = await db.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { message: "Parent category not found" },
        { status: 400 }
      );
    }

    // ✅ Create
    const subCategory = await db.subCategory.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        slug,

        category: {
          connect: { id: data.categoryId },
        },

        hsnCode:
          data.hsnCodeId && data.hsnCodeId !== ""
            ? { connect: { id: data.hsnCodeId } }
            : undefined,
      },
      include: {
        category: true,
        hsnCode: true,
      },
    });

    return NextResponse.json(subCategory, { status: 201 });

  } catch (error: any) {
    console.error("POST ERROR:", error);

    return NextResponse.json(
      { message: error.message || "Failed to create subcategory" },
      { status: 500 }
    );
  }
}

/* ================= GET ================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const subCategories = await db.subCategory.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              title: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
      include: {
        category: true,
        hsnCode: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(subCategories);

  } catch (error) {
    console.error("GET ERROR:", error);

    return NextResponse.json(
      { message: "Error fetching subcategories" },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */

export async function DELETE(req: Request) {
  try {
    const body: { ids: string[] } = await req.json();

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { message: "Invalid or empty IDs" },
        { status: 400 }
      );
    }

    await db.subCategory.deleteMany({
      where: {
        id: { in: body.ids },
      },
    });

    return NextResponse.json({
      message: "Selected subcategories deleted",
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { message: "Bulk delete failed" },
      { status: 500 }
    );
  }
}