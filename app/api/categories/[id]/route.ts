import { NextResponse } from "next/server";
import { updateCategory } from "@/actions/category";
import { generateUniqueSlug } from "@/lib/utils/generateUniqueSlug";
import { db } from "@/lib/db";
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const slug = await generateUniqueSlug(
      "category",
      body.title,
      params.id
    );

    const result = await updateCategory(params.id, {
      ...body,
      slug,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("GET ERROR:", error);

    return NextResponse.json(
      { message: "Fetch failed" },
      { status: 500 }
    );
  }
}


// ✅ DELETE CATEGORY
export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID is required" },
        { status: 400 }
      );
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}