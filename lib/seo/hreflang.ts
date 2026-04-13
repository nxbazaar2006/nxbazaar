export function generateHreflang(slug: string) {
  const base = "https://yourdomain.com";

  return [
    { rel: "alternate", hrefLang: "en", href: `${base}/en/markets/${slug}` },
    { rel: "alternate", hrefLang: "hi", href: `${base}/hi/markets/${slug}` },
    { rel: "alternate", hrefLang: "mr", href: `${base}/mr/markets/${slug}` },
  ];
}