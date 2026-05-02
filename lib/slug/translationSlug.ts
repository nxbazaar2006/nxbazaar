import { db } from "@/lib/db";
import { Language } from "@prisma/client";

export const SUPPORTED_SLUG_ENTITIES = [
  "category",
  "subcategory",
  "product",
  "blog",
  "vlog",
  "market",
] as const;

export type SlugEntity = (typeof SUPPORTED_SLUG_ENTITIES)[number];

export interface CreateTranslationSlugInput {
  entity: SlugEntity;
  parentId: string;
  locale: string;
  title: string;
  description?: string;
  slug?: string;
}

export function slugify(text: string): string {
  const value = String(text ?? "").trim();

  return (
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function normalizeLocale(locale: string): Language {
  const upper = locale.toUpperCase();

  if (!Object.values(Language).includes(upper as Language)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  return upper as Language;
}

async function isSlugTaken(
  entity: SlugEntity,
  locale: Language,
  slug: string
): Promise<boolean> {
  switch (entity) {
    case "category":
      return Boolean(
        await db.categoryTranslation.findFirst({
          where: { slug, locale },
          select: { id: true },
        })
      );
    case "subcategory":
      return Boolean(
        await db.subCategoryTranslation.findFirst({
          where: { slug, locale },
          select: { id: true },
        })
      );
    case "product":
      return Boolean(
        await db.productTranslation.findFirst({
          where: { slug, locale },
          select: { id: true },
        })
      );
    case "blog":
      return Boolean(
        await db.blogTranslation.findFirst({
          where: { slug, locale },
          select: { id: true },
        })
      );
    case "vlog":
      return Boolean(
        await db.vlogTranslation.findFirst({
          where: { slug, locale },
          select: { id: true },
        })
      );
    case "market":
      return Boolean(
        await db.marketTranslation.findFirst({
          where: { slug, locale },
          select: { id: true },
        })
      );
  }
}

export async function generateUniqueSlug(
  entity: SlugEntity,
  locale: string,
  value: string
): Promise<string> {
  const base = slugify(value);
  const normalizedLocale = normalizeLocale(locale);

  let slug = base;
  let counter = 1;

  while (counter < 1000) {
    if (!(await isSlugTaken(entity, normalizedLocale, slug))) {
      return slug;
    }

    slug = `${base}-${counter++}`;
  }

  throw new Error("Slug generation failed");
}

export async function createTranslationWithSlug(
  input: CreateTranslationSlugInput
) {
  const locale = normalizeLocale(input.locale);
  const slug = await generateUniqueSlug(
    input.entity,
    input.locale,
    input.slug ?? input.title
  );

  switch (input.entity) {
    case "category":
      return db.categoryTranslation.create({
        data: {
          categoryId: input.parentId,
          locale,
          title: input.title,
          description: input.description,
          slug,
        },
      });
    case "subcategory":
      return db.subCategoryTranslation.create({
        data: {
          subCategoryId: input.parentId,
          locale,
          title: input.title,
          description: input.description,
          slug,
        },
      });
    case "product":
      return db.productTranslation.create({
        data: {
          productId: input.parentId,
          locale,
          title: input.title,
          description: input.description,
          slug,
        },
      });
    case "blog":
      return db.blogTranslation.create({
        data: {
          blogId: input.parentId,
          locale,
          title: input.title,
          description: input.description,
          slug,
        },
      });
    case "vlog":
      return db.vlogTranslation.create({
        data: {
          vlogId: input.parentId,
          locale,
          title: input.title,
          slug,
        },
      });
    case "market":
      return db.marketTranslation.create({
        data: {
          marketId: input.parentId,
          locale,
          title: input.title,
          description: input.description,
          slug,
        },
      });
  }
}

export async function findEntityBySlug(
  entity: SlugEntity,
  locale: string,
  slug: string
) {
  const normalizedLocale = normalizeLocale(locale);

  switch (entity) {
    case "category":
      return db.category.findFirst({
        where: {
          translations: {
            some: { slug, locale: normalizedLocale },
          },
        },
        include: { translations: true },
      });
    case "subcategory":
      return db.subCategory.findFirst({
        where: {
          translations: {
            some: { slug, locale: normalizedLocale },
          },
        },
        include: { translations: true, category: true },
      });
    case "product":
      return db.product.findFirst({
        where: {
          translations: {
            some: { slug, locale: normalizedLocale },
          },
        },
        include: { translations: true, category: true, subCategory: true },
      });
    case "blog":
      return db.blog.findFirst({
        where: {
          translations: {
            some: { slug, locale: normalizedLocale },
          },
        },
        include: { translations: true, category: true },
      });
    case "vlog":
      return db.vlog.findFirst({
        where: {
          translations: {
            some: { slug, locale: normalizedLocale },
          },
        },
        include: { translations: true },
      });
    case "market":
      return db.market.findFirst({
        where: {
          translations: {
            some: { slug, locale: normalizedLocale },
          },
        },
        include: { translations: true, categories: true },
      });
  }
}
