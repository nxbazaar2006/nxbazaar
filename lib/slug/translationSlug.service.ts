<<<<<<< HEAD
export {
  createTranslationWithSlug,
  findEntityBySlug,
  findEntityBySlug as findEntityByTranslationSlug,
  generateUniqueSlug,
  slugify,
} from "./translationSlug";
=======
import { db } from "@/lib/db";
import { Language } from "@prisma/client";
import { SlugEntity, CreateTranslationSlugInput } from "./translationSlug.types";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const modelMap = {
  category: db.categoryTranslation,
  subcategory: db.subCategoryTranslation,
  product: db.productTranslation,
  blog: db.blogTranslation,
  vlog: db.vlogTranslation,
  market: db.marketTranslation,
} as const;

const parentFieldMap = {
  category: "categoryId",
  subcategory: "subCategoryId",
  product: "productId",
  blog: "blogId",
  vlog: "vlogId",
  market: "marketId",
} as const;

function normalizeLocale(locale: string): Language {
  const upper = locale.toUpperCase();

  if (!Object.values(Language).includes(upper as Language)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  return upper as Language;
}

async function isSlugTaken(entity: SlugEntity, locale: Language, slug: string): Promise<boolean> {
  const model = modelMap[entity];

  const exists = await model.findFirst({
    where: {
      slug,
      locale,
    },
    select: { id: true },
  });

  return !!exists;
}

export async function generateUniqueSlug(entity: SlugEntity, locale: string, value: string): Promise<string> {
  const base = slugify(value);
  const normalizedLocale = normalizeLocale(locale);

  let slug = base;
  let counter = 1;

  while (counter < 1000) {
    const exists = await isSlugTaken(entity, normalizedLocale, slug);

    if (!exists) return slug;

    slug = `${base}-${counter++}`;
  }

  throw new Error("Slug generation failed");
}

export async function createTranslationWithSlug(input: CreateTranslationSlugInput) {
  const model = modelMap[input.entity];
  const locale = normalizeLocale(input.locale);

  const slug = await generateUniqueSlug(input.entity, input.locale, input.slug ?? input.title);

  const parentField = parentFieldMap[input.entity];

  return model.create({
    data: {
      [parentField]: input.parentId,
      locale,
      title: input.title,
      description: input.description,
      slug,
    },
  });
}

export async function findEntityBySlug(entity: SlugEntity, locale: string, slug: string) {
  const normalizedLocale = normalizeLocale(locale);

  const includeMap = {
    category: { translations: true },
    subcategory: { translations: true, category: true },
    product: { translations: true, category: true, subCategory: true },
    blog: { translations: true, category: true },
    vlog: { translations: true },
    market: { translations: true, categories: true },
  };

  return db[entity].findFirst({
    where: {
      translations: {
        some: {
          slug,
          locale: normalizedLocale,
        },
      },
    },
    include: includeMap[entity],
  });
}

// Backward-compatible exports
export const generateUniqueTranslationSlug = generateUniqueSlug;
export const findEntityByTranslationSlug = findEntityBySlug;
>>>>>>> 6cf6bafd1bc31939473fdfa5a272376b494100f7
