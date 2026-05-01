"use server";

import { db } from "@/lib/db";
import {
  subCategorySchema,
  SubCategoryInput,
} from "@/lib/validators/subcategory.schema";
import { generateUniqueSlug } from "@/lib/utils/generateUniqueSlug";
import { generateUniqueTranslationSlug } from "@/lib/slug/translationSlug.service";
import { Language } from "@prisma/client";
import { handleError } from "@/lib/error-handler";
import {
  successResponse,
  errorResponse,
  ApiResponse,
} from "@/lib/response";

const toLocale = (locale: string) => locale.toUpperCase() as Language;

/* ================= CREATE ================= */

export async function createSubCategory(
  data: SubCategoryInput
): Promise<ApiResponse<unknown>> {
  try {
    const parsed = subCategorySchema.parse(data);
    const title = parsed.translations[0]?.title;

    if (!title) return errorResponse("Title required");

    const slug = parsed.slug ? parsed.slug : await generateUniqueSlug(title);

    const result = await db.$transaction(async (tx) => {
      const exists = await tx.subCategory.findUnique({ where: { slug } });
      if (exists) throw new Error("Slug already exists");

      const created = await tx.subCategory.create({
        data: {
          slug,
          imageUrl: parsed.imageUrl ?? null,
          isActive: parsed.isActive ?? true,
          categoryId: parsed.categoryId,
          hsnCodeId: parsed.hsnCodeId ?? null,
          metaTitle: parsed.metaTitle ?? null,
          metaDescription: parsed.metaDescription ?? null,
        },
      });

      for (const translation of parsed.translations) {
        const locale = toLocale(translation.locale);
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

    return successResponse(result);
  } catch (error: unknown) {
    const err = handleError(error);
    return errorResponse(err.message, err.errors);
  }
}

/* ================= UPDATE ================= */

export async function updateSubCategory(
  id: string,
  data: SubCategoryInput
): Promise<ApiResponse<unknown>> {
  try {
    const parsed = subCategorySchema.parse(data);
    const title = parsed.translations[0]?.title;

    if (!title) return errorResponse("Title required");

    const slug = parsed.slug ? parsed.slug : await generateUniqueSlug(title);

    const result = await db.$transaction(async (tx) => {
      const exists = await tx.subCategory.findFirst({ where: { slug, NOT: { id } } });
      if (exists) throw new Error("Slug already exists");

      await tx.subCategory.update({
        where: { id },
        data: {
          slug,
          imageUrl: parsed.imageUrl ?? null,
          isActive: parsed.isActive ?? true,
          categoryId: parsed.categoryId,
          hsnCodeId: parsed.hsnCodeId ?? null,
          metaTitle: parsed.metaTitle ?? null,
          metaDescription: parsed.metaDescription ?? null,
        },
      });

      await tx.subCategoryTranslation.deleteMany({ where: { subCategoryId: id } });

      for (const translation of parsed.translations) {
        const locale = toLocale(translation.locale);
        const translationSlug = await generateUniqueTranslationSlug(
          "subcategory",
          locale,
          translation.slug ?? translation.title
        );

        await tx.subCategoryTranslation.create({
          data: {
            subCategoryId: id,
            locale,
            title: translation.title,
            description: translation.description,
            slug: translationSlug,
          },
        });
      }

      return tx.subCategory.findUnique({
        where: { id },
        include: { translations: true, category: true, hsnCode: true },
      });
    });

    return successResponse(result);
  } catch (error: unknown) {
    const err = handleError(error);
    return errorResponse(err.message);
  }
}

export async function deleteSubCategory(id: string): Promise<ApiResponse<boolean>> {
  try {
    await db.subCategory.delete({ where: { id } });
    return successResponse(true);
  } catch (error: unknown) {
    const err = handleError(error);
    return errorResponse(err.message);
  }
}

export async function getSubCategories() {
  try {
    return await db.subCategory.findMany({
      include: { category: true, hsnCode: true, translations: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
}
