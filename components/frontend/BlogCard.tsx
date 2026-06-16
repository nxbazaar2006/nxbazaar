import Link from "next/link";
import Image from "next/image";
import { BlogType } from "@/types/blog.types";
import { getSafeTranslation } from "@/lib/getTranslation";

type Props = {
  blog: BlogType;
  locale?: string;
};

function removePlaceholderText(value: string) {
  return value
    .replace(/<p>\s*cvbcvbcvb\s*<\/p>/gi, "")
    .replace(/<\/?p[^>]*>/gi, "")
    .trim();
}

export default function BlogCard({ blog, locale = "en" }: Props) {
  const translation = getSafeTranslation(blog.translations ?? [], locale);

  const title =
    translation?.title ?? blog.translations?.[0]?.title ?? blog.slug;

  const description = removePlaceholderText(
    translation?.description ?? blog.translations?.[0]?.description ?? ""
  );

  const href =
    locale === "en"
      ? `/blogs/${blog.slug}`
      : `/${locale}/blogs/${blog.slug}`;

  const imageUrl =
    blog.imageUrl ??
    blog.relatedProducts?.[0]?.images?.find((image) => image.isPrimary)?.url ??
    blog.relatedProducts?.[0]?.images?.[0]?.url ??
    blog.relatedProducts?.[0]?.imageUrl;

  return (
    <Link href={href} className="block h-full">
      <article
        className="
          group relative h-full overflow-hidden rounded-2xl border border-white/10
          bg-white/55 shadow-[0_18px_60px_rgba(15,23,42,0.10)]
          backdrop-blur-2xl transition-all duration-500 ease-out
          before:pointer-events-none before:absolute before:inset-0
          before:bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(251,146,60,0.18),rgba(217,70,239,0.14),rgba(14,165,233,0.16))]
          before:opacity-80 before:transition-opacity before:duration-500
          after:pointer-events-none after:absolute after:inset-x-6 after:top-0 after:h-px
          after:bg-gradient-to-r after:from-orange-400/0 after:via-fuchsia-400/70 after:to-sky-400/0
          hover:-translate-y-1.5 hover:border-white/20
          hover:shadow-[0_28px_90px_rgba(15,23,42,0.18)]
          hover:before:opacity-100
          dark:bg-slate-950/35 dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)]
          dark:before:bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(251,146,60,0.16),rgba(217,70,239,0.13),rgba(14,165,233,0.14))]
        "
      >
        {imageUrl && (
          <div className="relative z-10 aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="
                object-cover transition-transform duration-700 ease-out
                group-hover:scale-110
              "
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-fuchsia-500/5 to-sky-400/20 opacity-75 transition-opacity duration-500 group-hover:opacity-50" />
          </div>
        )}

        <div className="relative z-10 space-y-3 p-5 sm:p-6">
          <h2 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-300">
            {title}
          </h2>

          {description && (
            <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-white/60">
              {description}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}