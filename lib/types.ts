import { Language } from "@prisma/client";

export type TranslationInput = {
  language: Language;
  title: string;
};

export type SlugModel =
  | "productTranslation"
  | "categoryTranslation"
  | "subCategoryTranslation"
  | "marketTranslation"
  | "blogTranslation"
  | "vlogTranslation";