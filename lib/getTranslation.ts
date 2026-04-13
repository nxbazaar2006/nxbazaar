export type TranslationBase = {
  locale: string;
};

export function getSafeTranslation<T extends TranslationBase>(
  translations: T[],
  locale: string,
  fallbackLocale: string = "en"
): T | undefined {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === fallbackLocale)
  );
}