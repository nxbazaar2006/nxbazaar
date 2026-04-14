export type TranslationBase = {
  locale: string;
};

export function getSafeTranslation<T extends TranslationBase>(
  translations: T[],
  locale: string,
  fallbackLocale: string = "en"
): T | undefined {
  const targetLocale = locale.toLowerCase();
  const targetFallback = fallbackLocale.toLowerCase();

  return (
    translations.find((t) => t.locale.toLowerCase() === targetLocale) ??
    translations.find((t) => t.locale.toLowerCase() === targetFallback)
  );
}
