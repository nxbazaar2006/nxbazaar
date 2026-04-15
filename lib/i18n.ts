export const LOCALES = ["en", "hi"];

export function getCurrentLocale(pathname: string) {
  if (!pathname) return "en";

  const segments = pathname.split("/");
  const locale = segments[1];

  if (LOCALES.includes(locale)) {
    return locale;
  }

  return "en";
}