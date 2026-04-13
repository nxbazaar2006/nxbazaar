"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  categorySchema,
  type CategoryInput,
} from "@/lib/validators/category.schema";
import type {
  Category,
  CategoryFormData,
  CategoryTranslation,
} from "@/types/category";

interface ActionResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
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

const toLocaleCode = (value: string): CategoryTranslation["locale"] =>
  value.toLowerCase() as CategoryTranslation["locale"];

function mapCategoryRecord(category: DbCategory): Category {
  const defaultTranslation =
    category.translations.find((item) => item.locale === "EN") ??
    category.translations[0];

  return {
    id: category.id,
    slug: category.slug,
    imageUrl: category.imageUrl,
    isActive: category.isActive,
    title: defaultTranslation?.title ?? category.slug,
    description: defaultTranslation?.description ?? null,
    translations: category.translations.map((translation) => ({
      id: translation.id,
      locale: toLocaleCode(translation.locale),
      title: translation.title,
      description: translation.description,
    })),
    products: category.products,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

async function buildSlug(input: CategoryInput): Promise<string> {
  if (input.slug) return input.slug;

  const englishTitle =
    input.translations.find((item) => item.locale === "EN")?.title ??
    input.translations[0]?.title;

  return (englishTitle ?? "category")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createCategory(
  data: CategoryFormData
): Promise<ActionResponse<Category>> {
  const parsed = categorySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid category payload",
    };
  }

  try {
    const slug = await buildSlug(parsed.data);

    const category = await db.category.create({
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

    revalidatePath("/dashboard/categories");
    return {
      success: true,
      message: "Category created successfully",
      data: mapCategoryRecord(category),
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, message: "Category slug already exists" };
    }

    return { success: false, message: "Failed to create category" };
  }
}

export async function getCategories(endpoint?: string): Promise<Category[] | Category | null> {
  if (endpoint?.startsWith("/filter/")) {
    const slug = endpoint.replace("/filter/", "");
    return getCategoryBySlug(slug);
  }

  const categories = await db.category.findMany({
    include: {
      translations: true,
      products: { select: { id: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return categories.map(mapCategoryRecord);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      translations: true,
      products: { select: { id: true } },
    },
  });

  return category ? mapCategoryRecord(category) : null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const category = await db.category.findUnique({
    where: { id },
    include: {
      translations: true,
      products: { select: { id: true } },
    },
  });

  return category ? mapCategoryRecord(category) : null;
}

export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<ActionResponse<Category>> {
  const parsed = categorySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid category payload",
    };
  }

  try {
    const slug = await buildSlug(parsed.data);

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

    revalidatePath("/dashboard/categories");
    return {
      success: true,
      message: "Category updated successfully",
      data: mapCategoryRecord(updated),
    };
  } catch {
    return { success: false, message: "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    await db.category.delete({ where: { id } });
    revalidatePath("/dashboard/categories");
    return { success: true, message: "Category deleted successfully" };
  } catch {
    return { success: false, message: "Failed to delete category" };
  }
}
