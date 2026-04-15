import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { subCategorySchema } from "@/lib/validators/subcategory.schema";
import { generateSlug } from "@/lib/utils/Slug";
import type { SubCategory } from "@/types/subcategory";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

type DbSubCategory = Prisma.SubCategoryGetPayload<{
  include: {
    category: {
      include: {
        translations: true;
      };
    };
    hsnCode: true;
    translations: true;
  };
}>;

const toLocaleCode = (value: string): SubCategory["translations"][number]["locale"] =>
  value.toLowerCase() as SubCategory["translations"][number]["locale"];

function mapSubCategoryRecord(record: DbSubCategory): SubCategory {
  const translation =
    record.translations.find((item) => item.locale === "EN") ??
    record.translations[0];

  const categoryTranslation =
    record.category.translations.find((item) => item.locale === "EN") ??
    record.category.translations[0];

  return {
    id: record.id,
    slug: record.slug,
    imageUrl: record.imageUrl,
    isActive: record.isActive,
    categoryId: record.categoryId,
    categoryTitle: categoryTranslation?.title ?? record.category.slug,
    hsnCodeId: record.hsnCodeId,
    hsnCode: record.hsnCode,
    title: translation?.title ?? record.slug,
    description: translation?.description ?? null,
    translations: record.translations.map((item) => ({
      id: item.id,
      locale: toLocaleCode(item.locale),
      title: item.title,
      description: item.description,
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function buildSlug(translations: Array<{ locale: string; title: string }>, slug?: string) {
  if (slug) return slug;

  const enTitle =
    translations.find((item) => item.locale.toLowerCase() === "en")?.title ??
    translations[0]?.title;

  return generateSlug(enTitle ?? "subcategory");
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const subCategory = await db.subCategory.findUnique({
      where: { id },
      include: {
        category: { include: { translations: true } },
        hsnCode: true,
        translations: true,
      },
    });

    if (!subCategory) {
      return NextResponse.json({ success: false, message: "SubCategory not found" }, { status: 404 });
    }

    return NextResponse.json(mapSubCategoryRecord(subCategory));
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch subcategory" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = subCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const slug = buildSlug(parsed.data.translations, parsed.data.slug);

    const updated = await db.subCategory.update({
      where: { id },
      data: {
        slug,
        imageUrl: parsed.data.imageUrl,
        isActive: parsed.data.isActive,
        categoryId: parsed.data.categoryId,
        hsnCodeId: parsed.data.hsnCodeId,
        translations: {
          deleteMany: {},
          create: parsed.data.translations,
        },
      },
      include: {
        category: { include: { translations: true } },
        hsnCode: true,
        translations: true,
      },
    });

    return NextResponse.json({ success: true, data: mapSubCategoryRecord(updated) });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await db.subCategory.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "SubCategory deleted" });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
