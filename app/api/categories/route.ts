import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validators/category.schema";
import type { Category } from "@/types/category";

type DbCategory = Prisma.CategoryGetPayload<{
  include: {
    translations: true;
    products: {
      select: {
        id: true;
      };
    };
  };
}>;

const toLocaleCode = (value: string) => value.toLowerCase() as Category["translations"][number]["locale"];

function mapCategoryRecord(category: DbCategory): Category {
  const translation =
    category.translations.find((item) => item.locale === "EN") ??
    category.translations[0];

  return {
    id: category.id,
    slug: category.slug,
    imageUrl: category.imageUrl,
    isActive: category.isActive,
    title: translation?.title ?? category.slug,
    description: translation?.description ?? null,
    translations: category.translations.map((item) => ({
      id: item.id,
      locale: toLocaleCode(item.locale),
      title: item.title,
      description: item.description,
    })),
    products: category.products,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const slug =
      parsed.data.slug ??
      createSlug(
        parsed.data.translations.find((item) => item.locale === "EN")?.title ??
          parsed.data.translations[0]?.title ??
          "category"
      );

    const created = await db.category.create({
      data: {
        slug,
        imageUrl: parsed.data.imageUrl,
        isActive: parsed.data.isActive,
        translations: {
          create: parsed.data.translations,
        },
      },
      include: {
        translations: true,
        products: { select: { id: true } },
      },
    });

    return NextResponse.json({ success: true, data: mapCategoryRecord(created) }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLocale = searchParams.get("locale");
    const locale = rawLocale ? rawLocale.toUpperCase() : null;

    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        products: { select: { id: true } },
        translations: locale ? { where: { locale: locale as Prisma.$Enums.Language } } : true,
      },
    });

    return NextResponse.json(categories.map(mapCategoryRecord));
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
