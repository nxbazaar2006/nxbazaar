type TranslationModel =
  | "productTranslation"
  | "categoryTranslation"
  | "subCategoryTranslation"
  | "marketTranslation"
  | "blogTranslation"
  | "vlogTranslation";

type SlugWhereInput = {
  slug: string;
  language: Language;
};

type ModelDelegate = {
  findFirst: (args: { where: SlugWhereInput }) => Promise<unknown>;
};

type DbWithTranslations = {
  [K in TranslationModel]: ModelDelegate;
};

export async function generateUniqueSlug(
  title: string,
  language: Language,
  model: TranslationModel
): Promise<string> {
  const baseSlug = slugify(title, language.toLowerCase());

  let slug = baseSlug;
  let counter = 1;

  const typedDb = db as unknown as DbWithTranslations;

  while (
    await typedDb[model].findFirst({
      where: { slug, language },
    })
  ) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}