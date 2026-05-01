import { NextResponse } from "next/server";
import { createCategory } from "@/actions/category";
import { db } from "@/lib/db";
import { Language } from "@prisma/client";
import { CategorySchema } from "@/lib/validators/category.schema";

/* ---------------------------------- */
/* ✅ SAFE LOCALE PARSER (NO ANY) */
/* ---------------------------------- */
function parseLocale(locale: string): Language {
  const upper = locale.toUpperCase();

  const isValid = Object.values(Language).includes(upper as Language);

  return isValid ? (upper as Language) : Language.EN;
}

/* ---------------------------------- */
/* ✅ ERROR HELPER (NO ANY) */
/* ---------------------------------- */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

/* ---------------------------------- */
/* ✅ POST */
/* ---------------------------------- */
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    const parsed = CategorySchema.parse(body);

    const result = await createCategory(parsed);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

/* ---------------------------------- */
/* ✅ GET */
/* ---------------------------------- */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const localeParam = searchParams.get("locale") ?? "EN";

    const locale = parseLocale(localeParam);

    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        translations: {
          where: { locale },
        },
        products: {
          take: 4,
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}