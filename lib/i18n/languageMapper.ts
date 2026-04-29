import { Language } from "@prisma/client";

export const localeMap: Record<string, Language> = {
  en: Language.EN,
  hi: Language.HI,
  mr: Language.MR,
  ta: Language.TA,
  te: Language.TE,
  kn: Language.KN,
  gu: Language.GU,
};

export function localeToLanguage(locale: string): Language {
  return localeMap[locale] ?? Language.EN;
}