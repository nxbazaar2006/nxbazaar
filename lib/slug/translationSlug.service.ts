import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils/Slug";
import { SlugEntity, CreateTranslationSlugInput } from "./translationSlug.types";

const normalizeEntity = (entity: SlugEntity): Exclude<SlugEntity, "vlog"> =>
  entity === "vlog" ? "blog" : entity;

const normalizeLocale = (locale: string): string => locale.toUpperCase();

async function isTranslationSlugTaken(entity: Exclude<SlugEntity, "vlog">, locale: string, slug: string) {
  switch (entity) {
    case "category":
      return !!(await db.categoryTranslation.findFirst({ where: { locale: locale as any, slug } }));
    case "subcategory":
      return !!(await db.subCategoryTranslation.findFirst({ where: { locale: locale as any, slug } }));
    case "product":
      return !!(await db.productTranslation.findFirst({ where: { locale: locale as any, slug } }));
    case "blog":
      return !!(await db.blogTranslation.findFirst({ where: { locale: locale as any, slug } }));
    case "market":
      return !!(await db.marketTranslation.findFirst({ where: { locale, slug } }));
  }
}

export async function generateUniqueTranslationSlug(
  entity: SlugEntity,
  locale: string,
  titleOrSlug: string
): Promise<string> {
  const normalizedEntity = normalizeEntity(entity);
  const normalizedLocale = normalizeLocale(locale);
  const base = generateSlug(titleOrSlug);

  let candidate = base;
  let counter = 1;

  while (counter < 1000) {
    const exists = await isTranslationSlugTaken(normalizedEntity, normalizedLocale, candidate);

    if (!exists) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter += 1;
  }

  throw new Error("Unable to generate unique translation slug");
}

export async function createTranslationWithSlug(input: CreateTranslationSlugInput) {
  const entity = normalizeEntity(input.entity);
  const locale = normalizeLocale(input.locale);
  const slug = await generateUniqueTranslationSlug(input.entity, locale, input.slug ?? input.title);

  switch (entity) {
    case "category":
      return db.categoryTranslation.create({
        data: {
          categoryId: input.parentId,
          locale: locale as any,
          title: input.title,
          description: input.description,
          slug,
        },
      });
    case "subcategory":
      return db.subCategoryTranslation.create({
        data: {
          subCategoryId: input.parentId,
          locale: locale as any,
          title: input.title,
          description: input.description,
          slug,
        },
      });
    case "product":
      return db.productTranslation.create({
        data: {
          productId: input.parentId,
          locale: locale as any,
          title: input.title,
          description: input.description,
          slug,
        },
      });
    case "blog":
      return db.blogTranslation.create({
        data: {
          blogId: input.parentId,
          locale: locale as any,
          title: input.title,
          description: input.description,
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

export async function findEntityByTranslationSlug(entity: SlugEntity, locale: string, slug: string) {
  const normalizedEntity = normalizeEntity(entity);
  const normalizedLocale = normalizeLocale(locale);

  switch (normalizedEntity) {
    case "category":
      return db.category.findFirst({
        where: { translations: { some: { locale: normalizedLocale as any, slug } } },
        include: { translations: true },
      });
    case "subcategory":
      return db.subCategory.findFirst({
        where: { translations: { some: { locale: normalizedLocale as any, slug } } },
        include: { translations: true, category: true },
      });
    case "product":
      return db.product.findFirst({
        where: { translations: { some: { locale: normalizedLocale as any, slug } } },
        include: { translations: true, category: true, subCategory: true },
      });
    case "blog":
      return db.blog.findFirst({
        where: { translations: { some: { locale: normalizedLocale as any, slug } } },
        include: { translations: true, category: true },
      });
    case "market":
      return db.market.findFirst({
        where: { translations: { some: { locale: normalizedLocale, slug } } },
        include: { translations: true, categories: true },
      });
  }
}
