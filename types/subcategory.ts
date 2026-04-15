import type { Language } from "@prisma/client";

export const LOCALES = ["en", "hi", "mr"] as const;

export type LocaleCode = Lowercase<`${Language}`>;

export interface SubCategoryTranslation {
  id?: string;
  locale: LocaleCode;
  title: string;
  description?: string | null;
}

export interface SubCategory {
  id: string;
  slug: string;
  imageUrl?: string | null;
  isActive: boolean;
  categoryId: string;
  categoryTitle?: string;
  hsnCodeId?: string | null;
  hsnCode?: {
    id: string;
    code: string;
    title: string;
    gstRate: number;
  } | null;
  title: string;
  description?: string | null;
  translations: SubCategoryTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface SubCategoryPayload {
  slug?: string;
  imageUrl?: string;
  isActive: boolean;
  categoryId: string;
  hsnCodeId?: string | null;
  translations: Array<{
    locale: LocaleCode;
    title: string;
    description?: string;
  }>;
}

export type SubCategoryFormData = SubCategoryPayload;
