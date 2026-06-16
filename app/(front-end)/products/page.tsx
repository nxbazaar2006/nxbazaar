import Product from "@/components/frontend/Product";
import { db } from "@/lib/db";
import Link from "next/link";

type ProductsPageProps = {
  searchParams?: Promise<{
    lang?: string;
    sort?: string;
    min?: string;
    max?: string;
    page?: string;
  }>;
};

function mapProduct(product: {
  id: string;
  userId: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  variants: {
    price: number;
    salePrice: number | null;
    image: string | null;
    isDefault: boolean;
  }[];
  images: { url: string; isPrimary: boolean }[];
  translations: {
    locale: string;
    title: string;
    slug: string | null;
  }[];
}) {
  const translation =
    product.translations.find(
      (item) => item.locale.toUpperCase() === "EN"
    ) ?? product.translations[0];
  const variant =
    product.variants.find((item) => item.isDefault) ?? product.variants[0];

  return {
    id: product.id,
    userId: product.userId,
    title: translation?.title ?? product.title,
    slug: translation?.slug ?? product.slug,
    imageUrl:
      variant?.image ??
      product.imageUrl ??
      product.images.find((image) => image.isPrimary)?.url ??
      product.images[0]?.url ??
      "/placeholder.png",
    salePrice: variant?.salePrice ?? variant?.price ?? 0,
  };
}

function buildPageUrl(
  page: number,
  params: { lang?: string; sort: string; min: number; max?: number }
) {
  const query = new URLSearchParams();

  query.set("page", page.toString());
  query.set("sort", params.sort);
  if (params.lang) query.set("lang", params.lang);
  if (params.min > 0) query.set("min", params.min.toString());
  if (params.max !== undefined) query.set("max", params.max.toString());

  return `/products?${query.toString()}`;
}

function normalizeLocale(locale?: string) {
  return ["hi", "mr"].includes(locale ?? "") ? locale!.toUpperCase() : "EN";
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const lang = resolvedParams.lang;
  const locale = normalizeLocale(lang);
  const sort = resolvedParams.sort === "desc" ? "desc" : "asc";
  const min = Number(resolvedParams.min ?? 0);
  const max = resolvedParams.max ? Number(resolvedParams.max) : undefined;
  const currentPage = Math.max(Number(resolvedParams.page ?? 1), 1);
  const pageSize = 12;

  const productsData = await db.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      images: {
        orderBy: {
          isPrimary: "desc",
        },
      },
      translations: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const filteredProducts = productsData
    .map((product) => {
      const translation =
        product.translations.find((item) => item.locale === locale) ??
        product.translations.find((item) => item.locale === "EN") ??
        product.translations[0];

      return mapProduct({
        ...product,
        translations: translation ? [translation] : [],
      });
    })
    .filter((product) => product.salePrice >= min)
    .filter((product) => (max === undefined ? true : product.salePrice <= max))
    .sort((a, b) =>
      sort === "desc" ? b.salePrice - a.salePrice : a.salePrice - b.salePrice
    );

  const totalPages = Math.max(Math.ceil(filteredProducts.length / pageSize), 1);
  const products = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <main className="space-y-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={lang ? `/products?lang=${lang}` : "/products"}
            className="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15"
          >
            Relevance
          </Link>
          <Link
            href={buildPageUrl(1, { lang, sort: "desc", min, max })}
            className="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15"
          >
            Price - High to Low
          </Link>
          <Link
            href={buildPageUrl(1, { lang, sort: "asc", min, max })}
            className="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15"
          >
            Price - Low to High
          </Link>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Product key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No products found.
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Link
            href={buildPageUrl(Math.max(currentPage - 1, 1), {
              lang,
              sort,
              min,
              max,
            })}
            className="rounded-full bg-black/5 px-4 py-2 text-sm transition hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
          >
            Previous
          </Link>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={buildPageUrl(Math.min(currentPage + 1, totalPages), {
              lang,
              sort,
              min,
              max,
            })}
            className="rounded-full bg-black/5 px-4 py-2 text-sm transition hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
          >
            Next
          </Link>
        </div>
      )}
    </main>
  );
}
