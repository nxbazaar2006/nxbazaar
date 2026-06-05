import Link from "next/link";
import CategoryCarousel from "./CategoryCarousel";

type Props = {
  category: {
    title: string;
    slug: string;
    products?: React.ComponentProps<typeof CategoryCarousel>["products"];
  };
  isMarketPage?: boolean;
  lang?: string;
};

export default function CategoryList({
  category,
  isMarketPage = false,
  lang,
}: Props) {
  if (!category) return null;

  const categoryHref = `/category/${category.slug}${
    lang ? `?lang=${lang}` : ""
  }`;

  return (
    <section
      className="
        apple-glass overflow-hidden text-foreground
      "
    >
      <div
        className="
          flex flex-wrap items-center justify-between gap-3
          border-b border-white/10 px-5 py-4 md:px-6
        "
      >
        <h2 className="text-lg font-semibold tracking-tight">
          {category.title}
        </h2>

        <Link
          href={categoryHref}
          className="
            apple-glass-control px-4 py-2 text-sm font-medium
            transition-all duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-r
            hover:from-orange-500/20 hover:via-pink-500/20 hover:to-purple-500/20
          "
        >
          See All
        </Link>
      </div>

      <div className="p-4 md:p-5">
        <CategoryCarousel
          isMarketPage={isMarketPage}
          products={category.products ?? []}
        />
      </div>
    </section>
  );
}
