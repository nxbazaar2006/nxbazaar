import {db} from "@/lib/db";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  _: Request,
  { params }: Params
) {
  try {
    const { slug } = await params;
    const category = await db.category.findUnique({
      where: {
        slug,
      },
      include: {
        products: {
          where: { isActive: true },
        },
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
    console.error("CATEGORY_FETCH_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
