import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { subCategorySchema } from "@/lib/validators/subcategory.schema";
import type { SubCategory } from "@/types/subcategory";
import { generateSlug } from "@/lib/utils/Slug";

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

function buildSlug(translations: SubCategory["translations"], slug?: string) {
  if (slug) return slug;

  const enTitle =
    translations.find((item) => item.locale === "en")?.title ??
    translations[0]?.title;

  return generateSlug(enTitle ?? "subcategory");
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = subCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const slug = buildSlug(
      parsed.data.translations.map((item) => ({
        ...item,
        locale: item.locale.toLowerCase() as SubCategory["translations"][number]["locale"],
      })),
      parsed.data.slug
    );

    const created = await db.subCategory.create({
      data: {
        slug,
        imageUrl: parsed.data.imageUrl,
        isActive: parsed.data.isActive,
        categoryId: parsed.data.categoryId,
        hsnCodeId: parsed.data.hsnCodeId,
        translations: {
          create: parsed.data.translations,
        },
      },
      include: {
        category: { include: { translations: true } },
        hsnCode: true,
        translations: true,
      },
    });

    return NextResponse.json({ success: true, data: mapSubCategoryRecord(created) }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const categoryId = searchParams.get("categoryId")?.trim();

    const records = await db.subCategory.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              translations: {
                some: {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: { include: { translations: true } },
        hsnCode: true,
        translations: true,
      },
    });

    return NextResponse.json(records.map(mapSubCategoryRecord));
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { ids?: string[] };

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or empty IDs" },
        { status: 400 }
      );
    }

    await db.subCategory.deleteMany({
      where: {
        id: { in: body.ids },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Selected subcategories deleted",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Bulk delete failed" },
      { status: 500 }
    );
  }
}
