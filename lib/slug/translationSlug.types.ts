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
