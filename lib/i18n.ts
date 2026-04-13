export const LOCALES = ["en", "hi", "mr"] as const;
export const DEFAULT_LOCALE = "en";

export function getCurrentLocale(pathname: string) {
  const segments = pathname.split("/");
  const locale = segments[1];

  if (LOCALES.includes(locale as any)) {
    return locale;
  }

  return DEFAULT_LOCALE;
}