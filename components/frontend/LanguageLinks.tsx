import Link from "next/link";

type TranslationLink = {
  locale: string;
  slug?: string | null;
  title?: string | null;
};

type Props = {
  translations: TranslationLink[];
  route:
    | "category"
    | "subcategory"
    | "products"
    | "market"
    | "blogs"
    | "vlog";
  fallbackSlug: string;
  currentLocale?: string;
};

const localeLabels: Record<string, string> = {
  en: "English",
  hi: "हिंदी",
  mr: "मराठी",
};

export default function LanguageLinks({
  translations,
  route,
  fallbackSlug,
  currentLocale = "en",
}: Props) {
  const normalizedCurrent = currentLocale.toLowerCase();

  const links = translations
    .map((translation) => {
      const locale = translation.locale.toLowerCase();

      return {
        locale,
        label: localeLabels[locale] ?? locale.toUpperCase(),
        slug: translation.slug ?? fallbackSlug,
      };
    })
    .filter((link) => link.slug);

  if (links.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((link) => {
        const isActive = link.locale === normalizedCurrent;

        return (
          <Link
            key={`${link.locale}-${link.slug}`}
            href={
              link.locale === "en"
                ? `/${route}/${link.slug}`
                : `/${link.locale}/${route}/${link.slug}`
            }
            aria-current={isActive ? "page" : undefined}
            className={`
              group relative overflow-hidden
              rounded-2xl px-4 py-2.5
              text-sm font-medium
              border transition-all duration-300
              hover:scale-105
              ${
                isActive
                  ? `
                    border-transparent
                    bg-gradient-to-r
                    from-orange-500
                    via-pink-500
                    to-purple-500
                    text-white
                    shadow-lg
                  `
                  : `
                    border-slate-200
                    bg-white
                    text-foreground
                    hover:border-slate-300
                    hover:bg-slate-100
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:hover:border-slate-600
                    dark:hover:bg-slate-700
                  `
              }
            `}
          >
            <span className="relative z-10">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
