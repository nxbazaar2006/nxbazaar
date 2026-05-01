import { NextResponse } from "next/server";
import { updateCategory } from "@/actions/category";
import { db } from "@/lib/db";
import { CategorySchema } from "@/lib/validators/category.schema";

/* ---------------------------------- */
/* ✅ ERROR HELPER */
/* ---------------------------------- */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

/* ---------------------------------- */
/* ✅ PUT (UPDATE) */
/* ---------------------------------- */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ FIX

    const body: unknown = await req.json();
    const parsed = CategorySchema.parse(body);

    const result = await updateCategory(id, parsed);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("PUT ERROR:", error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

/* ---------------------------------- */
/* ✅ GET (SINGLE) */
/* ---------------------------------- */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ FIX

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
  } catch (error: unknown) {
    console.error("GET ERROR:", error);

    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

/* ---------------------------------- */
/* ✅ DELETE */
/* ---------------------------------- */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ FIX

    if (!id) {
      return NextResponse.json(
        { message: "Invalid ID" },
        { status: 400 }
      );
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Deleted successfully",
    });
  } catch (error: unknown) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}