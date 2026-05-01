"use server";

import { db } from "@/lib/db";
import { CategorySchema } from "@/lib/validators/category.schema";
import {
  generateUniqueSlug,
  createTranslationWithSlug,
} from "@/lib/slug/translationSlug";
import { revalidatePath } from "next/cache";



/* ---------------------------------- */
/* ✅ CREATE */
/* ---------------------------------- */
export async function createCategory(data: unknown) {
  const parsed = CategorySchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const { imageUrl, isActive, translations } = parsed.data;

  const baseTitle = translations[0].title;
  const slug = await generateUniqueSlug("category", "EN", baseTitle);

  // ✅ पहले category create करो
  const category = await db.category.create({
    data: {
      slug,
      imageUrl,
      isActive,
    },
  });

  // ✅ फिर translations create करो (IMPORTANT FIX)
  for (const t of translations) {
    await createTranslationWithSlug({
      entity: "category",
      parentId: category.id,
      locale: t.locale,
      title: t.title,
      description: t.description,
    });
  }

  const result = await db.category.findUnique({
    where: { id: category.id },
    include: { translations: true },
  });

  revalidatePath("/dashboard/categories");

  return { data: result };
}

/* ---------------------------------- */
/* ✅ UPDATE */
/* ---------------------------------- */
export async function updateCategory(id: string, data: unknown) {
  const parsed = CategorySchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const { imageUrl, isActive, translations } = parsed.data;

  const existing = await db.category.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!existing) {
    return { error: "Category not found" };
  }

  // ✅ slug logic (EN based)
  const newTitle = translations.find((t) => t.locale === "EN")?.title;
  let slug = existing.slug;

  if (
    newTitle &&
    newTitle !==
      existing.translations.find((t) => t.locale === "EN")?.title
  ) {
    slug = await generateUniqueSlug("category", "EN", newTitle);
  }

  // ✅ update category
  await db.category.update({
    where: { id },
    data: {
      slug,
      imageUrl,
      isActive,
      translations: {
        deleteMany: {}, // साफ करो
      },
    },
  });

  // ✅ फिर translations recreate करो
  for (const t of translations) {
    await createTranslationWithSlug({
      entity: "category",
      parentId: id,
      locale: t.locale,
      title: t.title,
      description: t.description,
    });
  }

  const updated = await db.category.findUnique({
    where: { id },
    include: { translations: true },
  });

  revalidatePath("/dashboard/categories");

  return { data: updated };
}

/* ---------------------------------- */
/* ✅ DELETE */
/* ---------------------------------- */
export async function deleteCategory(id: string) {
  await db.category.delete({ where: { id } });

  revalidatePath("/dashboard/categories");

  return { success: true };
}

/* ---------------------------------- */
/* ✅ GET ONE */
/* ---------------------------------- */
export async function getCategoryById(id: string) {
  if (!id) throw new Error("Invalid ID");

  const category = await db.category.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!category) throw new Error("Category not found");

  return { data: category };
}

/* ---------------------------------- */
/* ✅ GET ALL */
/* ---------------------------------- */
export async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: { translations: true },
    });
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    return [];
  }
}