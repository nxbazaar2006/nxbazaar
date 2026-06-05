export function getCurrentLocale(pathname: string) {
  const locale = pathname.split("/").filter(Boolean)[0];

  return ["hi", "mr"].includes(locale) ? locale : "en";
}
