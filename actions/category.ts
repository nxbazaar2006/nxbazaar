"use server";

import { Prisma, Category } from "@prisma/client";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/* ==============================
TYPES
============================== */

interface CategoryFormData {
  title: string;
  imageUrl?: string;
}

interface ActionResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}

/* ==============================
UTIL: SLUG GENERATOR (ENTERPRISE)
============================== */

async function generateUniqueSlug(base: string): Promise<string> {
  const slugBase = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  let slug = slugBase;
  let count = 1;

  while (true) {
    const existing = await db.category.findUnique({
      where: { slug },
    });

    if (!existing) break;

    slug = `${slugBase}-${count++}`;
  }

  return slug;
}

/* ==============================
CREATE CATEGORY
============================== */

export async function createCategory(
  data: CategoryFormData
): Promise<ActionResponse<Category>> {
  try {
    if (!data.title || data.title.length < 2) {
      return {
        success: false,
        message: "Title is required ❌",
      };
    }

    const slug = await generateUniqueSlug(data.title);

    const category = await db.category.create({
      data: { ...data, slug },
    });

    revalidatePath("/dashboard/categories");

    return {
      success: true,
      message: "Category created successfully ✅",
      data: category,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Category already exists ❌",
      };
    }

    console.error("CREATE CATEGORY ERROR:", error);

    return {
      success: false,
      message: "Failed to create category ❌",
    };
  }
}

/* ==============================
GET ALL CATEGORIES
============================== */

export async function getCategories(): Promise<Category[]> {
  try {
    return await db.category.findMany({
      include: {
        products: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);
    return [];
  }
}

/* ==============================
GET CATEGORY BY SLUG
============================== */

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  try {
    return await db.category.findUnique({
      where: { slug },
      include: {
        products: true,
      },
    });
  } catch (error) {
    console.error("GET CATEGORY BY SLUG ERROR:", error);
    return null;
  }
}

/* ==============================
GET CATEGORY BY ID
============================== */

export async function getCategoryById(
  id: string
): Promise<Category | null> {
  try {
    return await db.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
  } catch (error) {
    console.error("GET CATEGORY BY ID ERROR:", error);
    return null;
  }
}

/* ==============================
UPDATE CATEGORY
============================== */

export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<ActionResponse<Category>> {
  try {
    if (!data.title || data.title.length < 2) {
      return {
        success: false,
        message: "Title is required ❌",
      };
    }

    const slug = await generateUniqueSlug(data.title);

    const category = await db.category.update({
      where: { id },
      data: { ...data, slug },
    });

    revalidatePath("/dashboard/categories");

    return {
      success: true,
      message: "Category updated successfully ✏️",
      data: category,
    };
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return {
      success: false,
      message: "Failed to update category ❌",
    };
  }
}

/* ==============================
DELETE CATEGORY
============================== */

export async function deleteCategory(
  id: string
): Promise<ActionResponse> {
  try {
    await db.category.delete({
      where: { id },
    });

    revalidatePath("/dashboard/categories");

    return {
      success: true,
      message: "Category deleted successfully 🗑️",
    };
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return {
      success: false,
      message: "Failed to delete category ❌",
    };
  }
}