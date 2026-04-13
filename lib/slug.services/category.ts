import { db } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { CategoryInput } from "@/schemas/category";

/**
 * CREATE CATEGORY
 */
export async function createCategoryService(data: CategoryInput) {
  const translations = await Promise.all(
    data.translations.map(async (t) => {
      const slug = await generateUniqueSlug(
        t.title,
        t.locale,
        "category"
      );

      return {
        ...t,
        slug,
      };
    })
  );

  return db.category.create({
    data: {
      imageUrl: data.imageUrl,
      isActive: data.isActive,
      position: data.position,
      translations: {
        create: translations,
      },
    },
    include: { translations: true },
  });
}

/**
 * UPDATE CATEGORY
 */
export async function updateCategoryService(
  id: string,
  data: CategoryInput
) {
  const oldTranslations = await db.categoryTranslation.findMany({
    where: { categoryId: id },
  });

  const translations = await Promise.all(
    data.translations.map(async (t) => {
      const existing = oldTranslations.find(
        (ot) => ot.locale === t.locale
      );

      if (existing && existing.title === t.title) {
        return {
          ...t,
          slug: existing.slug,
        };
      }

      const slug = await generateUniqueSlug(
        t.title,
        t.locale,
        "category"
      );

      return {
        ...t,
        slug,
      };
    })
  );

  await db.categoryTranslation.deleteMany({
    where: { categoryId: id },
  });

  return db.category.update({
    where: { id },
    data: {
      imageUrl: data.imageUrl,
      isActive: data.isActive,
      position: data.position,
      translations: {
        create: translations,
      },
    },
    include: { translations: true },
  });
}

/**
 * SOFT DELETE
 */
export async function deleteCategoryService(id: string) {
  return db.category.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}