"use server";

import { db } from "@/lib/db";
import { CategorySchema } from "@/lib/validators/category.schema";
import { generateUniqueSlug } from "@/lib/slug/generateUniqueSlug";
import { revalidatePath } from "next/cache";
import { Language } from "@prisma/client";

// ✅ locale mapper (FIX)
function mapLocale(locale: string): Language {
  return locale.toUpperCase() as Language;
}

// =====================
// ✅ CREATE
// =====================
export async function createCategory(data: unknown) {
  const parsed = CategorySchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const { title, description, imageUrl, isActive, locale } =
    parsed.data;

  const normalizedLocale = mapLocale(locale);

  const slug = await generateUniqueSlug(title);

  const category = await db.category.create({
    data: {
      slug,
      imageUrl,
      isActive,
      translations: {
        create: [
          {
            title,
            description,
            locale: normalizedLocale,
          },
        ],
      },
    },
    include: { translations: true },
  });

  revalidatePath("/dashboard/categories");

  return { data: category };
}

// =====================
// ✅ UPDATE
// =====================
export async function updateCategory(id: string, data: unknown) {
  const parsed = CategorySchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const { title, description, imageUrl, isActive, locale } =
    parsed.data;

  const normalizedLocale = mapLocale(locale);

  // 🔍 existing category
  const existing = await db.category.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!existing) {
    return { error: "Category not found" };
  }

  // ✅ correct locale-wise title
  const oldTranslation = existing.translations?.find(
    (t) => t.locale === normalizedLocale
  );

  const oldTitle = oldTranslation?.title;

  let slug = existing.slug;

  // ✅ slug update only if title changed
  if (title !== oldTitle) {
    slug = await generateUniqueSlug(title);
  }

  const updated = await db.category.update({
    where: { id },
    data: {
      slug,
      imageUrl,
      isActive,
      translations: {
        deleteMany: { locale: normalizedLocale },
        create: [
          {
            title,
            description,
            locale: normalizedLocale,
          },
        ],
      },
    },
    include: { translations: true },
  });

  revalidatePath("/dashboard/categories");

  return { data: updated };
}

// =====================
// ✅ DELETE
// =====================
export async function deleteCategory(id: string) {
  await db.category.delete({ where: { id } });
  return { success: true };
}

// =====================
// ✅ GET ONE
// =====================
export async function getCategoryById(id: string) {
  if (!id) throw new Error("Invalid ID");

  const category = await db.category.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!category) throw new Error("Category not found");

  return { data: category };
}

// =====================
// ✅ GET ALL
// =====================
export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: { translations: true },
    });

    return categories; // ✅ direct array
  } catch (error) {
    console.error("Error fetching categories:", error);
    return []; // ✅ always array
  }
}