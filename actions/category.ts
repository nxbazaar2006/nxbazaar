"use server";

import { db } from "@/lib/db";
import { CategorySchema } from "@/lib/validators/category.schema";
import {
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

  // ✅ पहले category create करो
  const category = await db.category.create({
    data: {
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

  // ✅ update category
  await db.category.update({
    where: { id },
    data: {
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

function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale = "EN"
) {
  const normalizedLocale = locale.toUpperCase();

  return (
    translations.find(
      (translation) => translation.locale.toUpperCase() === normalizedLocale
    ) ??
    translations.find((translation) => translation.locale.toUpperCase() === "EN") ??
    translations[0]
  );
}

function mapProduct(product: {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  translations: { locale: string; title: string; slug: string | null }[];
  variants: { price: number; salePrice: number | null; image: string | null }[];
  images: { url: string; isPrimary: boolean }[];
}, locale = "EN") {
  const translation = pickTranslation(product.translations, locale);
  const variant = product.variants[0];

  return {
    id: product.id,
    title: translation?.title ?? product.title,
    slug: translation?.slug ?? product.slug,
    translations: product.translations,
    imageUrl:
      variant?.image ??
      product.imageUrl ??
      product.images.find((image) => image.isPrimary)?.url ??
      product.images[0]?.url ??
      "/placeholder.png",
    salePrice: variant?.salePrice ?? variant?.price ?? 0,
  };
}

function mapCategory(category: {
  id: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: {
    locale: string;
    title: string;
    slug: string | null;
    description: string | null;
  }[];
  products: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    translations: { locale: string; title: string; slug: string | null }[];
    variants: { price: number; salePrice: number | null; image: string | null }[];
    images: { url: string; isPrimary: boolean }[];
  }[];
}, locale = "EN") {
  const translation = pickTranslation(category.translations, locale);

  return {
    id: category.id,
    title: translation?.title ?? "Category",
    slug: translation?.slug ?? category.id,
    imageUrl: category.imageUrl || null,
    description: translation?.description ?? null,
    isActive: category.isActive,
    products: category.products.map((product) => mapProduct(product, locale)),
    translations: category.translations,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

/* ---------------------------------- */
/* ✅ GET ALL */
/* ---------------------------------- */
export async function getCategories(path?: string, locale = "EN") {
  try {
    const categoryInclude = {
      translations: true,
      products: {
        where: {
          isActive: true,
        },
        include: {
          translations: true,
          variants: {
            where: {
              isActive: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          images: {
            orderBy: {
              isPrimary: "desc",
            },
          },
        },
      },
    } as const;

    if (path) {
      const slug = path.split("/").filter(Boolean).pop();

      if (!slug) {
        return null;
      }

      const category = await db.category.findFirst({
        where: {
          translations: {
            some: {
              slug,
            },
          },
        },
        include: categoryInclude,
      });

      return category ? mapCategory(category, locale) : null;
    }

    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: categoryInclude,
    });

    return categories.map((category) => mapCategory(category, locale));
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
