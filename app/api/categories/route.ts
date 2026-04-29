import { NextResponse } from "next/server";
import { createCategory } from "@/actions/category";
import { db } from "@/lib/db"; // ✅ FIX
import { Language } from "@prisma/client";

// =====================
// ✅ POST (CREATE)
// =====================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ❌ slug यहाँ मत बनाओ
    const result = await createCategory(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// =====================
// ✅ GET (WITH LOCALE FILTER)
// =====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const localeParam = searchParams.get("locale") || "en";

    // ✅ enum convert
    const locale = localeParam.toUpperCase() as Language;

    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        translations: {
          where: { locale }, // ✅ FILTER
        },
        products: {
          take: 4,
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}