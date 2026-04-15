"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { subCategorySchema } from "@/lib/validators/subcategory.schema";
import { generateSlug } from "@/lib/utils/Slug";
import type { ActionResponse } from "@/types/action-response";
import type { SubCategory, SubCategoryPayload } from "@/types/subcategory";

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
  const primaryTranslation =
    record.translations.find((item) => item.locale === "EN") ??
    record.translations[0];

  const primaryCategoryTranslation =
    record.category.translations.find((item) => item.locale === "EN") ??
    record.category.translations[0];

  return {
    id: record.id,
    slug: record.slug,
    imageUrl: record.imageUrl,
    isActive: record.isActive,
    categoryId: record.categoryId,
    categoryTitle: primaryCategoryTranslation?.title ?? record.category.slug,
    hsnCodeId: record.hsnCodeId,
    hsnCode: record.hsnCode
      ? {
          id: record.hsnCode.id,
          code: record.hsnCode.code,
          title: record.hsnCode.title,
          gstRate: record.hsnCode.gstRate,
        }
      : null,
    title: primaryTranslation?.title ?? record.slug,
    description: primaryTranslation?.description ?? null,
    translations: record.translations.map((translation) => ({
      id: translation.id,
      locale: toLocaleCode(translation.locale),
      title: translation.title,
      description: translation.description,
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function buildSlug(payload: SubCategoryPayload): string {
  if (payload.slug) return payload.slug;

  const englishTitle =
    payload.translations.find((item) => item.locale === "en")?.title ??
    payload.translations[0]?.title;

  return generateSlug(englishTitle ?? "subcategory");
}

export async function createSubCategory(
  data: SubCategoryPayload
): Promise<ActionResponse<SubCategory>> {
  const parsed = subCategorySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid subcategory payload",
    };
  }

  try {
    const slug = buildSlug(data);

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

    revalidatePath("/dashboard/subcategories");
    return {
      success: true,
      message: "SubCategory created successfully",
      data: mapSubCategoryRecord(created),
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, message: "SubCategory slug already exists" };
    }

    return { success: false, message: "Failed to create subcategory" };
  }
}

export async function updateSubCategory(
  id: string,
  data: SubCategoryPayload
): Promise<ActionResponse<SubCategory>> {
  const parsed = subCategorySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid subcategory payload",
    };
  }

  try {
    const slug = buildSlug(data);

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

    revalidatePath("/dashboard/subcategories");
    return {
      success: true,
      message: "SubCategory updated successfully",
      data: mapSubCategoryRecord(updated),
    };
  } catch {
    return { success: false, message: "Failed to update subcategory" };
  }
}

export async function deleteSubCategory(id: string): Promise<ActionResponse> {
  try {
    await db.subCategory.delete({ where: { id } });

    revalidatePath("/dashboard/subcategories");
    return {
      success: true,
      message: "SubCategory deleted successfully",
    };
  } catch {
    return {
      success: false,
      message: "Failed to delete subcategory",
    };
  }
}

export async function getSubCategories(): Promise<SubCategory[]> {
  const records = await db.subCategory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { include: { translations: true } },
      hsnCode: true,
      translations: true,
    },
  });

  return records.map(mapSubCategoryRecord);
}

export async function getSubCategoryById(id: string): Promise<SubCategory | null> {
  const record = await db.subCategory.findUnique({
    where: { id },
    include: {
      category: { include: { translations: true } },
      hsnCode: true,
      translations: true,
    },
  });

  return record ? mapSubCategoryRecord(record) : null;
}

export async function getSubCategoriesByCategory(categoryId: string): Promise<SubCategory[]> {
  const records = await db.subCategory.findMany({
    where: { categoryId },
    include: {
      category: { include: { translations: true } },
      hsnCode: true,
      translations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return records.map(mapSubCategoryRecord);
}
