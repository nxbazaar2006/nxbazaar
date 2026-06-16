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
        border bg-card text-card-foreground shadow-sm min-w-0 overflow-hidden overflow-hidden rounded-3xl text-foreground
      "
    >
      <div
        className="
          flex flex-wrap items-center justify-between gap-3
          px-5 py-4 md:px-6
        "
      >
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {category.title}
        </h2>

        <Link
          href={categoryHref}
          className="
            outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-full border border-slate-950/10 bg-white px-4 py-2 text-sm font-medium
            text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50
            dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15
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
