import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validators/category.schema";
import type { Category } from "@/types/category";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

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

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const rawLocale = searchParams.get("locale");
    const locale = rawLocale ? rawLocale.toUpperCase() : null;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: { select: { id: true } },
        translations: locale ? { where: { locale: locale as Prisma.$Enums.Language } } : true,
      },
    });

    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(mapCategoryRecord(category));
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body: unknown = await req.json();
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

    const updated = await db.category.update({
      where: { id },
      data: {
        slug,
        imageUrl: parsed.data.imageUrl,
        isActive: parsed.data.isActive,
        translations: {
          deleteMany: {},
          create: parsed.data.translations,
        },
      },
      include: {
        translations: true,
        products: { select: { id: true } },
      },
    });

    return NextResponse.json({ success: true, data: mapCategoryRecord(updated) });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 }
    );
  }
}
