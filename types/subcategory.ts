import type { Language } from "@prisma/client";

export type LocaleCode = `${Language}` | Lowercase<`${Language}`>;

export interface Option {
  id: string;
  title: string;
}

export interface HsnCodeOption {
  id: string;
  code: string;
  title: string;
  gstRate: number;
}

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
  hsnCodeId?: string | null;
  translations: SubCategoryTranslation[];
  category?: Option | null;
  hsnCode?: HsnCodeOption | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategoryFormValues {
  title: string;
  description?: string;
  locale: LocaleCode;
  categoryId: string;
  hsnCodeId?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface SubCategoryInput {
  slug?: string;
  imageUrl?: string;
  isActive: boolean;
  categoryId: string;
  hsnCodeId?: string | null;
  translations: {
    title: string;
    description?: string;
    locale: LocaleCode;
  }[];
}

export interface UpdateSubCategoryPayload {
  id: string;
  data: SubCategoryInput;
}
