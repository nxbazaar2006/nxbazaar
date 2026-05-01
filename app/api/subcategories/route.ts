import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subCategorySchema } from "@/lib/validators/subcategory.schema";
import { generateUniqueSlug } from "@/lib/utils/generateUniqueSlug";
import { generateUniqueTranslationSlug } from "@/lib/slug/translationSlug.service";
import { ZodError } from "zod";
import { Language } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = subCategorySchema.parse(body);

    // ✅ Safe title extract
    const title = data.translations?.[0]?.title;

    if (!title) {
      return NextResponse.json(
        { message: "Title is required for slug" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(title);

    const subCategory = await db.$transaction(async (tx) => {
      const created = await tx.subCategory.create({
        data: {
          slug,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
          categoryId: data.categoryId,
          hsnCodeId: data.hsnCodeId,
        },
      });

      for (const translation of data.translations) {
        const locale = translation.locale.toUpperCase() as Language;
        const translationSlug = await generateUniqueTranslationSlug(
          "subcategory",
          locale,
          translation.slug ?? translation.title
        );

        await tx.subCategoryTranslation.create({
          data: {
            subCategoryId: created.id,
            locale,
            title: translation.title,
            description: translation.description,
            slug: translationSlug,
          },
        });
      }

      return tx.subCategory.findUnique({
        where: { id: created.id },
        include: { translations: true, category: true, hsnCode: true },
      });
    });

    return NextResponse.json(subCategory, { status: 201 });
  } catch (error) {
    console.error("SUBCATEGORY CREATE ERROR:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message:
            error.issues[0]?.message ?? "Invalid subcategory payload",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Create failed" },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale")?.toUpperCase() || "EN";

  const data = await db.subCategory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      translations: {
        where: {
          locale: {
            in: [locale, "EN"],
          },
        },
      },
      category: {
        include: {
          translations: true,
        },
      },
      hsnCode: true,
    },
  });

  const formattedData = data.map((item) => {
    const translation =
      item.translations.find((t) => t.locale === locale) ??
      item.translations[0] ??
      null;
    const categoryTranslation =
      item.category.translations.find((t) => t.locale === locale) ??
      item.category.translations.find((t) => t.locale === "EN") ??
      item.category.translations[0] ??
      null;

    return {
      id: item.id,
      slug: item.slug,
      imageUrl: item.imageUrl,
      isActive: item.isActive,
      categoryId: item.categoryId,
      category: item.category
        ? {
            id: item.category.id,
            title: categoryTranslation?.title ?? item.category.slug,
          }
        : null,
      hsnCodeId: item.hsnCodeId ?? null,
      hsnCode: item.hsnCode
        ? {
            id: item.hsnCode.id,
            code: item.hsnCode.code,
            title: item.hsnCode.title,
            gstRate: item.hsnCode.gstRate,
          }
        : null,
      translations: translation
        ? [
            {
              id: translation.id,
              locale: translation.locale.toLowerCase(),
              title: translation.title,
              description: translation.description,
            },
          ]
        : [],
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  });

  return NextResponse.json(formattedData);
}
