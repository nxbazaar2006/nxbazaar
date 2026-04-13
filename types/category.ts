import type { Language } from "@prisma/client";

export type LocaleCode = Lowercase<`${Language}`>;

export interface CategoryTranslation {
  id: string;
  locale: LocaleCode;
  title: string;
  description?: string | null;
}

export interface Category {
  id: string;
  slug: string;
  imageUrl?: string | null;
  isActive: boolean;
  title: string;
  description?: string | null;
  translations: CategoryTranslation[];
  products: {
    id: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTranslationInput {
  locale: LocaleCode;
  title: string;
  description?: string;
}

export interface CategoryFormData {
  slug?: string;
  imageUrl?: string;
  isActive: boolean;
  translations: CategoryTranslationInput[];
}
