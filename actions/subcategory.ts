"use server";

import { Language } from "@prisma/client";

import { db } from "@/lib/db";
import {
  subCategorySchema,
  type SubCategoryInput,
} from "@/lib/validators/subcategory.schema";
import {
  generateUniqueSlug,
  generateUniqueTranslationSlug,
} from "@/lib/slug/translationSlug.service";
import { handleError } from "@/lib/error-handler";
import { successResponse, errorResponse, type ApiResponse } from "@/lib/response";

const toLocale = (locale: string) => locale.toUpperCase() as Language;

async function translationsWithSlugs(
  translations: SubCategoryInput["translations"]
) {
  return Promise.all(
    translations.map(async (translation) => {
      const locale = toLocale(translation.locale);

      return {
        locale,
        title: translation.title,
        description: translation.description,
        slug: await generateUniqueTranslationSlug(
          "subcategory",
          locale,
          translation.slug ?? translation.title
        ),
      };
    })
  );
}

export async function createSubCategory(
  data: SubCategoryInput
): Promise<ApiResponse<unknown>> {
  try {
    const parsed = subCategorySchema.parse(data);
    const title = parsed.translations[0]?.title;

    if (!title) {
      return errorResponse("Title required");
    }

    const slug = parsed.slug
      ? parsed.slug
      : await generateUniqueSlug("subcategory", "EN", title);
    const translations = await translationsWithSlugs(parsed.translations);

    const result = await db.subCategory.create({
      data: {
        slug,
        imageUrl: parsed.imageUrl ?? null,
        isActive: parsed.isActive ?? true,
        categoryId: parsed.categoryId,
        hsnCodeId: parsed.hsnCodeId ?? null,
        translations: {
          create: translations,
        },
      } as never,
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

export async function updateSubCategory(
  id: string,
  data: SubCategoryInput
): Promise<ApiResponse<unknown>> {
  try {
    const parsed = subCategorySchema.parse(data);
    const title = parsed.translations[0]?.title;

    if (!title) {
      return errorResponse("Title required");
    }

    const slug = parsed.slug
      ? parsed.slug
      : await generateUniqueSlug("subcategory", "EN", title);
    const translations = await translationsWithSlugs(parsed.translations);

    const result = await db.$transaction(async (tx) => {
      await tx.subCategoryTranslation.deleteMany({
        where: { subCategoryId: id },
      });

      return tx.subCategory.update({
        where: { id },
        data: {
          slug,
          imageUrl: parsed.imageUrl ?? null,
          isActive: parsed.isActive ?? true,
          categoryId: parsed.categoryId,
          hsnCodeId: parsed.hsnCodeId ?? null,
          translations: {
            create: translations,
          },
        } as never,
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

export async function deleteSubCategory(
  id: string
): Promise<ApiResponse<boolean>> {
  try {
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

export async function getSubCategories(): Promise<ApiResponse<unknown>> {
  try {
    const subCategories = await db.subCategory.findMany({
      include: { category: true, hsnCode: true, translations: true },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(subCategories);
  } catch (error: unknown) {
    const err = handleError(error);
    return errorResponse(err.message, err.errors);
  }
}
