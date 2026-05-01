"use server";

import { db } from "@/lib/db";
import {
  subCategorySchema,
  SubCategoryInput,
} from "@/lib/validators/subcategory.schema";
import { generateUniqueSlug } from "@/lib/utils/generateUniqueSlug";
import { handleError } from "@/lib/error-handler";
import {
  successResponse,
  errorResponse,
  ApiResponse,
} from "@/lib/response";

/* ================= CREATE ================= */

export async function createSubCategory(
  data: SubCategoryInput
): Promise<ApiResponse<unknown>> {
  try {
    const parsed = subCategorySchema.parse(data);

    // 🔥 slug per translation
    const translationsWithSlug = await Promise.all(
      parsed.translations.map(async (t) => ({
        ...t,
        slug: await generateUniqueSlug(
          "subcategory",
          t.locale,
          t.slug ?? t.title
        ),
      }))
    );

    const result = await db.subCategory.create({
      data: {
        imageUrl: parsed.imageUrl ?? null,
        isActive: parsed.isActive ?? true,
        categoryId: parsed.categoryId,
        hsnCodeId: parsed.hsnCodeId ?? null,

        translations: {
          create: translationsWithSlug,
        },

        metaTitle: parsed.metaTitle ?? null,
        metaDescription: parsed.metaDescription ?? null,
      },
      include: {
        translations: true,
        category: true,
        hsnCode: true,
      },
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

    const translationsWithSlug = await Promise.all(
      parsed.translations.map(async (t) => ({
        ...t,
        slug: await generateUniqueSlug(
          "subcategory",
          t.locale,
          t.slug ?? t.title
        ),
      }))
    );

    const result = await db.$transaction(async (tx) => {
      await tx.subCategoryTranslation.deleteMany({
        where: { subCategoryId: id },
      });

      return tx.subCategory.update({
        where: { id },
        data: {
          imageUrl: parsed.imageUrl ?? null,
          isActive: parsed.isActive ?? true,
          categoryId: parsed.categoryId,
          hsnCodeId: parsed.hsnCodeId ?? null,

          translations: {
            create: translationsWithSlug,
          },

          metaTitle: parsed.metaTitle ?? null,
          metaDescription: parsed.metaDescription ?? null,
        },
        include: {
          translations: true,
          category: true,
          hsnCode: true,
        },
      });
    });

    return successResponse(result);
  } catch (error: unknown) {
    const err = handleError(error);
    return errorResponse(err.message, err.errors);
  }
}

/* ================= DELETE ================= */

export async function deleteSubCategory(
  id: string
): Promise<ApiResponse<boolean>> {
  try {
    // 🔥 soft delete (recommended)
    await db.subCategory.update({
      where: { id },
      data: { isActive: false },
    });

    return successResponse(true);
  } catch (error: unknown) {
    const err = handleError(error);
    return errorResponse(err.message);
  }
}

/* ================= GET ================= */

export async function getSubCategories(): Promise<
  ApiResponse<unknown>
> {
  try {
    const subCategories = await db.subCategory.findMany({
      include: {
        category: true,
        hsnCode: true,
        translations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(subCategories);
  } catch (error: unknown) {
    const err = handleError(error);
    return errorResponse(err.message);
  }
}