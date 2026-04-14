export const LOCALES = ["en", "hi", "mr"] as const;

export type Language = (typeof LOCALES)[number];

export interface TranslationInput {
  locale: Language;
  title: string;
  description?: string;
}

export interface HsnCode {
  id: string;
  code: string;
  description?: string;
}

export interface SubCategoryFormData {
  categoryId: string;
  imageUrl?: string;
  isActive: boolean;
  translations: TranslationInput[];
  hsnCodeId: string | null;
}