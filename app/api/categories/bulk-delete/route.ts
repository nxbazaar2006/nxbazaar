import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type BulkDeleteBody = {
  ids: string[];
};

export async function POST(request: Request) {
  try {
    const body: BulkDeleteBody = await request.json();

    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "No IDs provided" },
        { status: 400 }
      );
    }

    await db.category.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      message: "Deleted successfully",
    });
  } catch (error: unknown) {
    // ✅ Safe error handling
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete categories";

    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}